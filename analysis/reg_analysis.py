import numpy as np
import pandas as pd
import os
import seaborn as sns
import matplotlib.pyplot as plt


# Load data
data_dir = 'data/study_1'
file_names = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
dfs = []
for idx, file_name in enumerate(file_names):
    df = pd.read_csv(os.path.join(data_dir, file_name))
    df['id'] = file_name
    if len(df.loc[df['phase'] == 'test', 'trial']) == 64:
        dfs.append(df)
    else:
        print(f'incomplete: {file_name}')
data = pd.concat(dfs, ignore_index=True)

# Manage data
for col_name in ['rt', 'block', 'trial', 'sub_trial', 'condition', 'reward', 's_count', 'a1_count', 'a2_count', 'a3_count', 'a4_count']:
    data[col_name] = pd.to_numeric(data[col_name], errors='coerce').astype(float)
train_data = data.loc[
    (data['phase'] == 'training') 
    & (data['attention_check'] == False)
    & (data['action'].notna())
    & (data['valid']), :]
test_data = data.loc[data['phase'] == 'test', :]

# Anonymize
id_map = {old_id: i+1 for i, old_id in enumerate(sorted(data['id'].unique()))}
data['id'] = data['id'].map(id_map)
train_data['id'] = train_data['id'].map(id_map)
test_data['id'] = test_data['id'].map(id_map)

# Exclude ids
attention_check_data = data[data['attention_check'] == True]
attention_check_accuracy = attention_check_data.groupby(['id']).apply(
    lambda x: (x['response'] == x['image']).mean()
).reset_index(name='accuracy')
attention_check_accuracy = attention_check_accuracy.sort_values('accuracy', ascending=False)
excl_id = attention_check_accuracy.loc[attention_check_accuracy['accuracy'] < .85, 'id'].values
exclude_ids = excl_id
data = data[~data['id'].isin(exclude_ids)].copy()
train_data = train_data[~train_data['id'].isin(exclude_ids)].copy()
test_data = test_data[~test_data['id'].isin(exclude_ids)].copy()

# Train-test action correlations
train_proportions = train_data.groupby(['id', 'condition', 'image']).apply(
    lambda x: (x['action'].isin(['A1', 'A3'])).mean()
).reset_index(name='proportion')
test_proportions = test_data.groupby(['id', 'condition', 'image']).apply(
    lambda x: (x['action'].isin(['A1', 'A3'])).mean()
).reset_index(name='proportion')



train_action_counts = train_data.groupby(['id', 'condition', 'image'])['action'].value_counts().reset_index(name='count')
train_action_counts['subset'] = np.where(train_action_counts['action'].isin(['A1', 'A2']), 0, 1)
train_action_counts['total_count'] = train_action_counts.groupby(['id', 'condition', 'image', 'subset'])['count'].transform('sum')
train_action_counts['proportion'] = train_action_counts['count'] / train_action_counts['total_count']
train_action_counts['phase'] = 'train'

test_action_counts = test_data.groupby(['id', 'condition', 'image'])['action'].value_counts().reset_index(name='count')
test_action_counts['total_count'] = test_action_counts.groupby(['id', 'condition', 'image'])['count'].transform('sum')
test_action_counts['proportion'] = test_action_counts['count'] / test_action_counts['total_count']
test_action_counts['phase'] = 'test'

action_counts = pd.concat((train_action_counts, test_action_counts))

action_counts_pivot = action_counts.pivot_table(index=['id', 'condition', 'image', 'action'], columns='phase', values='proportion').reset_index()
fig, axs = plt.subplots(2, 2, figsize=(8, 6))
for i, cond in enumerate([0, 1]):
    subset = action_counts_pivot[(action_counts_pivot['action'] == 'A1') & (action_counts_pivot['condition'] == cond)]
    sns.regplot(x='train', y='test', data=subset, ax=axs[0, i])
    axs[0, i].set_title(f'N(A3)={15 if cond == 0 else 30}')
    axs[0, i].set_xlabel('Train Proportion A1')
    axs[0, i].set_ylabel('Test Proportion A1')

    subset = action_counts_pivot[(action_counts_pivot['action'] == 'A3') & (action_counts_pivot['condition'] == cond)]
    sns.regplot(x='train', y='test', data=subset, ax=axs[1, i])
    axs[1, i].set_xlabel('Train Proportion A3')
    axs[1, i].set_ylabel('Test Proportion A3')
plt.tight_layout()
plt.show()

fig, axs = plt.subplots(1, 4, figsize=(12, 4))
for i, action in enumerate(['A1', 'A2', 'A3', 'A4']):
    subset = action_counts_pivot[action_counts_pivot['action'] == action]
    sns.regplot(x='train', y='test', data=subset, ax=axs[i])
    axs[i].set_title(f'Action {action}')
    axs[i].set_xlabel('Train Proportion')
    axs[i].set_ylabel('Test Proportion')
plt.tight_layout()
plt.show()

pass