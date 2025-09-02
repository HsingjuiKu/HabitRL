import numpy as np
import pandas as pd
import os
import seaborn as sns
import matplotlib.pyplot as plt


# Load data
data_dir = 'data/pilot_4'
file_names = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
dfs = []
for idx, file_name in enumerate(file_names):
    df = pd.read_csv(os.path.join(data_dir, file_name))
    df['id'] = file_name
    dfs.append(df)
data = pd.concat(dfs, ignore_index=True)

# Manage data
for col_name in ['rt', 'block', 'trial', 'sub_trial', 'condition', 'reward', 's_count', 'a1_count', 'a2_count', 'a3_count', 'a4_count']:
    data[col_name] = pd.to_numeric(data[col_name], errors='coerce').astype(float)
train_data = data.loc[
    (data['phase'] == 'training') 
    & (data['attention_check'] == False)
    & (data['action'].notna()), :]
test_data = data.loc[data['phase'] == 'test', :]

# Anonymize
id_map = {old_id: i+1 for i, old_id in enumerate(sorted(data['id'].unique()))}
data['id'] = data['id'].map(id_map)
train_data['id'] = train_data['id'].map(id_map)
test_data['id'] = test_data['id'].map(id_map)

# Exclude inattentive participants
train_data['correct'] = train_data['action'].isin(['A1', 'A3']).values
subset = train_data[train_data['s_count'] > 0]
prop_correct_per_id = subset.groupby('id')['correct'].mean().reset_index(name='prop_correct')

fig, ax = plt.subplots(figsize=(10, 6))
sns.barplot(data=prop_correct_per_id, x='id', y='prop_correct', palette='viridis', ax=ax)
ax.set_xlabel('Participant ID')
ax.set_ylabel('')
ax.set_title('')
ax.set_ylim(0, 1)

for p in ax.patches:
    height = p.get_height()
    ax.annotate(f'{height:.2f}', (p.get_x() + p.get_width() / 2., height),
                ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.show()


exclude_ids = [1, 5, 6, 9, 10]
data = data[~data['id'].isin(exclude_ids)].copy()
train_data = train_data[~train_data['id'].isin(exclude_ids)].copy()
test_data = test_data[~test_data['id'].isin(exclude_ids)].copy()

# Plot learning curves
prop_data = (
    train_data[train_data['action'].isin(['A1', 'A2', 'A3', 'A4'])]
    .groupby(['id', 's_count', 'action'])
    .size()
    .unstack(fill_value=0)
    .reset_index()
)
prop_data['A1_over_A2'] = prop_data['A1'] / (prop_data['A1'] + prop_data['A2'])
prop_data['A3_over_A4'] = prop_data['A3'] / (prop_data['A3'] + prop_data['A4'])
prop_data = prop_data.loc[prop_data['s_count'] <= 15, :]
plot_df = prop_data.melt(
    id_vars=['id', 's_count'],
    value_vars=['A1_over_A2', 'A3_over_A4'],
    var_name='comparison',
    value_name='proportion'
)
fig, axs = plt.subplots(2, 1, figsize=(12, 8))
sns.lineplot(
    data=plot_df.loc[plot_df['comparison'] == 'A1_over_A2'],
    x='s_count',
    y='proportion',
    hue='id',
    markers=True,
    dashes=False,
    ci=None,
    ax=axs[0],
    palette=sns.color_palette("tab10", n_colors=plot_df['id'].nunique())
)
axs[0].set_xlabel('s_count')
axs[0].set_ylabel('Proportion')

sns.lineplot(
    data=plot_df.loc[plot_df['comparison'] == 'A3_over_A4'],
    x='s_count',
    y='proportion',
    hue='id',
    markers=True,
    dashes=False,
    ci=None,
    ax=axs[1],
    palette=sns.color_palette("tab10", n_colors=plot_df['id'].nunique())
)
plt.tight_layout()
plt.show()




# Calculate maximum time_elapsed for each participant
max_time_per_id = data.groupby('id')['time_elapsed'].max().reset_index(name='max_time_elapsed')
max_time_per_id['max_time_elapsed'] /= 60000

# Plot number of different actions per image and id in test_data
unique_actions_per_image = test_data.groupby(['id', 'image'])['action'].nunique().reset_index(name='num_actions')

fig, ax = plt.subplots(figsize=(12, 8))
sns.stripplot(data=unique_actions_per_image, x='image', y='num_actions', hue='id', dodge=True, ax=ax)
ax.set_title('Number of Different Actions per Image in Test Data')
ax.set_xlabel('Image')
ax.set_ylabel('Number of Different Actions')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Plot attention check accuracy
attention_check_data = data[data['attention_check'] == True]
attention_check_accuracy = attention_check_data.groupby(['id', 'condition']).apply(
    lambda x: (x['response'] == x['image']).mean()
).reset_index(name='accuracy')

fig, ax = plt.subplots(figsize=(10, 6))
sns.barplot(data=attention_check_accuracy, x='condition', y='accuracy', hue='id', ax=ax)
ax.set_title('Attention Check Accuracy by Condition')
ax.set_xlabel('Condition')
ax.set_ylabel('Accuracy (Proportion Correct)')
ax.legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.show()

# Plot exploration
action_counts_train = train_data.groupby(['id', 'action', 'condition']).size().reset_index(name='count')

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

conditions = train_data['condition'].unique()
for i, condition in enumerate(conditions):
    condition_data = action_counts_train[action_counts_train['condition'] == condition]
    sns.pointplot(data=condition_data, x='action', y='count', hue='id', dodge=True, ax=axes[i])
    axes[i].set_title(f'{condition}')
    axes[i].set_xlabel('Action')
    axes[i].set_ylabel('Frequency')
    axes[i].legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()

# Plot main effect
unique_ids = test_data['id'].unique()
unique_actions = ['A1', 'A2', 'A3', 'A4']
unique_conditions = test_data['condition'].unique()
all_combinations = pd.MultiIndex.from_product([unique_ids, unique_actions, unique_conditions],
                                             names=['id', 'action', 'condition'])
action_counts = test_data.groupby(['id', 'action', 'condition']).size()
action_counts = action_counts.reindex(all_combinations, fill_value=0).reset_index(name='count')

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
order = ['A1', 'A2', 'A3', 'A4']
conditions = test_data['condition'].unique()

for i, condition in enumerate(conditions):
    condition_data = action_counts[action_counts['condition'] == condition]
    # Boxplot shows distribution across participants; overlay individual points per id
    sns.boxplot(data=condition_data, x='action', y='count', order=order, ax=axes[i], color='lightgray', showcaps=True)
    sns.stripplot(data=condition_data, x='action', y='count', order=order, hue='id', dodge=True, ax=axes[i], jitter=True, size=6, palette=sns.color_palette("tab10", n_colors=plot_df['id'].nunique()))
    axes[i].set_title(f'N(A3) = {15 if condition == 0 else 30}')
    axes[i].set_xlabel('Action')
    axes[i].set_ylabel('Frequency')
    axes[i].legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()



a = 1