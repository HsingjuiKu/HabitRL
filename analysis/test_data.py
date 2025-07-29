import numpy as np
import pandas as pd
import os
import seaborn as sns
import matplotlib.pyplot as plt


# Load data
data_dir = 'data/pilot_2'
file_names = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
dfs = []
for idx, file_name in enumerate(file_names):
    df = pd.read_csv(os.path.join(data_dir, file_name))
    df['id'] = file_name
    dfs.append(df)
data = pd.concat(dfs, ignore_index=True)
train_data = data.loc[data['phase'] == 'training', :]
test_data = data.loc[data['phase'] == 'test', :]

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
unique_actions = ['A1', 'A2', 'A3', 'A4']  # Based on the plot
unique_conditions = test_data['condition'].unique()
all_combinations = pd.MultiIndex.from_product([unique_ids, unique_actions, unique_conditions], 
                                             names=['id', 'action', 'condition'])
action_counts = test_data.groupby(['id', 'action', 'condition']).size()
action_counts = action_counts.reindex(all_combinations, fill_value=0).reset_index(name='count')
action_counts['proportion'] = action_counts['count'] / 24

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

conditions = test_data['condition'].unique()
for i, condition in enumerate(conditions):
    condition_data = action_counts[action_counts['condition'] == condition]
    sns.pointplot(data=condition_data, x='action', y='proportion', hue='id', dodge=True, ax=axes[i], order=['A1', 'A2', 'A3', 'A4'])
    axes[i].set_title(f'Condition {condition}')
    axes[i].set_xlabel('Action')
    axes[i].set_ylabel('Relative frequency')
    axes[i].legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()

a = 1