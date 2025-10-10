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
test_data = data.loc[(data['phase'] == 'test') 
                     & (data['valid']) 
                     & (data['valid'] != 'false'), :]

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
train_action_counts = train_data.groupby(['id', 'image', 'action']).size().reindex(
    pd.MultiIndex.from_product([
        train_data['id'].unique(),
        train_data['image'].unique(),
        ['A1', 'A2', 'A3', 'A4']
    ], names=['id', 'image', 'action']),
    fill_value=0
).reset_index(name='a_count')
reward_counts = train_data[train_data['reward'] == 1].groupby(['id', 'image', 'action'])['reward'].value_counts().reset_index(name='r_count')
train_action_counts = train_action_counts.merge(reward_counts[['id', 'image', 'action', 'r_count']], 
                                                on=['id', 'image', 'action'], 
                                                how='left').fillna(0)
train_action_counts['subset'] = np.where(train_action_counts['action'].isin(['A1', 'A2']), 0, 1)
train_action_counts['total_subset_count'] = train_action_counts.groupby(['id', 'image', 'subset'])['a_count'].transform('sum')
train_action_counts['proportion_subset'] = train_action_counts['a_count'] / train_action_counts['total_subset_count']
train_action_counts['total_count'] = train_action_counts.groupby(['id', 'image'])['a_count'].transform('sum')
train_action_counts['proportion_total'] = train_action_counts['a_count'] / train_action_counts['total_count']
train_action_counts['accuracy'] = train_action_counts['a_count'] / train_action_counts['total_count']
a3 = train_action_counts[train_action_counts['action'] == 'A3'][['id', 'image', 'a_count']].rename(columns={'a_count': 'A3_a_count'})
train_action_counts = train_action_counts.merge(a3, on=['id', 'image'], how='left')
train_action_counts['condition'] = (train_action_counts['A3_a_count'] == 30).astype(int)
train_action_counts.drop(columns=['A3_a_count'], inplace=True)
train_action_counts['phase'] = 'train'

test_action_counts = test_data.groupby(['id', 'image', 'action']).size().reindex(
    pd.MultiIndex.from_product([
        test_data['id'].unique(),
        test_data['image'].unique(),
        ['A1', 'A2', 'A3', 'A4']
    ], names=['id', 'image', 'action']),
    fill_value=0
).reset_index(name='a_count')
test_action_counts['total_count'] = test_action_counts.groupby(['id', 'image'])['a_count'].transform('sum')
test_action_counts['proportion'] = test_action_counts['a_count'] / test_action_counts['total_count']
test_action_counts = test_action_counts.merge(train_action_counts[['id', 'image', 'action', 'condition']], on=['id', 'image', 'action'], how='left')
test_action_counts['phase'] = 'test'

# Overall train-test proportion correlation per id & image
# Overall train-test proportion correlation per id & image
overall_corr_data = train_action_counts[['id', 'image', 'action', 'proportion_total']].merge(
    test_action_counts[['id', 'image', 'action', 'proportion']], on=['id', 'image', 'action']
).rename(columns={'proportion_total': 'train_prop', 'proportion': 'test_prop'})

fig, ax = plt.subplots(figsize=(8, 6))
sns.regplot(x='train_prop', y='test_prop', data=overall_corr_data, ax=ax, scatter_kws={'alpha':0.5})
overall_corr = overall_corr_data['train_prop'].corr(overall_corr_data['test_prop'])
ax.set_title(f'Overall Train vs Test Proportions (r={overall_corr:.2f})')
ax.set_xlabel('Train Proportion')
ax.set_ylabel('Test Proportion')
plt.show()

# Prepare data for a_count scatterplots
train_a_counts = train_action_counts.pivot_table(values='a_count', index=['id', 'image', 'condition'], columns='action', fill_value=0).reset_index()
test_a_counts = test_action_counts.pivot_table(values='a_count', index=['id', 'image', 'condition'], columns='action', fill_value=0).reset_index()
merged_a = train_a_counts.merge(test_a_counts, on=['id', 'image', 'condition'], suffixes=('_train', '_test'))

# Scatterplots for a_count with regression lines and coefficients, separated by condition
for cond in sorted(merged_a['condition'].unique()):
    cond_data = merged_a[merged_a['condition'] == cond]
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    fig.suptitle(f'Condition {cond} - Test Action Counts vs Train Action Counts')
    corr1 = cond_data['A2_train'].corr(cond_data['A1_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A2_train'] + jitter_x, y=cond_data['A1_test'] + jitter_y, ax=axes[0, 0])
    axes[0, 0].set_title(f'N(A1) vs. N(A2) (r={corr1:.2f})')
    corr2 = cond_data['A4_train'].corr(cond_data['A1_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A4_train'] + jitter_x, y=cond_data['A1_test'] + jitter_y, ax=axes[0, 1])
    axes[0, 1].set_title(f'N(A1) vs. N(A4) (r={corr2:.2f})')
    corr3 = cond_data['A2_train'].corr(cond_data['A3_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A2_train'] + jitter_x, y=cond_data['A3_test'] + jitter_y, ax=axes[1, 0])
    axes[1, 0].set_title(f'N(A3) vs. N(A2) (r={corr3:.2f})')
    corr4 = cond_data['A4_train'].corr(cond_data['A3_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A4_train'] + jitter_x, y=cond_data['A3_test'] + jitter_y, ax=axes[1, 1])
    axes[1, 1].set_title(f'N(A3) vs. N(A4) (r={corr4:.2f})')
    plt.tight_layout()
    plt.show()

# Prepare data for r_count scatterplots
train_r_counts = train_action_counts.pivot_table(values='r_count', index=['id', 'image', 'condition'], columns='action', fill_value=0).reset_index()
merged_r = train_r_counts.merge(test_a_counts, on=['id', 'image', 'condition'], suffixes=('_train_r', '_test'))

# Scatterplots for r_count with regression lines and coefficients, separated by condition
for cond in sorted(merged_r['condition'].unique()):
    cond_data = merged_r[merged_r['condition'] == cond]
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    fig.suptitle(f'Condition {cond} - Test Action Counts vs Train Reward Counts')
    corr5 = cond_data['A2_train_r'].corr(cond_data['A1_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A2_train_r'] + jitter_x, y=cond_data['A1_test'] + jitter_y, ax=axes[0, 0])
    axes[0, 0].set_title(f'N(A1) vs. R(A2) (r={corr5:.2f})')
    corr6 = cond_data['A4_train_r'].corr(cond_data['A1_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A4_train_r'] + jitter_x, y=cond_data['A1_test'] + jitter_y, ax=axes[0, 1])
    axes[0, 1].set_title(f'N(A1) vs. R(A4) (r={corr6:.2f})')
    corr7 = cond_data['A2_train_r'].corr(cond_data['A3_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A2_train_r'] + jitter_x, y=cond_data['A3_test'] + jitter_y, ax=axes[1, 0])
    axes[1, 0].set_title(f'N(A3) vs. R(A2) (r={corr7:.2f})')
    corr8 = cond_data['A4_train_r'].corr(cond_data['A3_test'])
    jitter_x = np.random.normal(0, 0.1, len(cond_data))
    jitter_y = np.random.normal(0, 0.1, len(cond_data))
    sns.regplot(x=cond_data['A4_train_r'] + jitter_x, y=cond_data['A3_test'] + jitter_y, ax=axes[1, 1])
    axes[1, 1].set_title(f'N(A3) vs. R(A4) (r={corr8:.2f})')
    plt.tight_layout()
    plt.show()

# Prepare data for proportion scatterplots
merged_prop = train_action_counts[['id', 'image', 'action', 'proportion_total', 'condition']].merge(
    test_action_counts[['id', 'image', 'action', 'proportion']], on=['id', 'image', 'action'], how='left'
).rename(columns={'proportion_total': 'train_prop', 'proportion': 'test_prop'})

# Scatterplots for proportions with regression lines and coefficients, separated by condition
for cond in sorted(merged_prop['condition'].unique()):
    cond_data = merged_prop[merged_prop['condition'] == cond]
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    fig.suptitle(f'Condition {cond} - Test Proportions vs Train Proportions')
    actions = ['A1', 'A2', 'A3', 'A4']
    for i, action in enumerate(actions):
        ax = axes.flat[i]
        data = cond_data[cond_data['action'] == action]
        corr = data['train_prop'].corr(data['test_prop'])
        sns.regplot(x='train_prop', y='test_prop', data=data, ax=ax)
        ax.set_title(f'{action} (r={corr:.2f})')
        ax.set_xlabel('Train Proportion')
        ax.set_ylabel('Test Proportion')
    plt.tight_layout()
    plt.show()


# Accuracy
train_proportions = train_data.groupby(['id', 'condition', 'image']).apply(
    lambda x: (x['action'].isin(['A1', 'A3'])).mean()
).reset_index(name='proportion')
test_proportions = test_data.groupby(['id', 'condition', 'image']).apply(
    lambda x: (x['action'].isin(['A1', 'A3'])).mean()
).reset_index(name='proportion')

# Every action


pass