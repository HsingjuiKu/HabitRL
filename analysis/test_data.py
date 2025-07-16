import numpy as np
import pandas as pd
import os
import seaborn as sns
import matplotlib.pyplot as plt


# Load data
data_dir = 'data/'
file_names = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
dfs = []
for idx, file_name in enumerate(file_names):
    df = pd.read_csv(os.path.join(data_dir, file_name))
    df['id'] = file_name
    dfs.append(df)
data = pd.concat(dfs, ignore_index=True)
train_data = data.loc[data['phase'] == 'training', :]
test_data = data.loc[data['phase'] == 'test', :]

d = train_data.loc[(train_data['id'] == 'unknown-20250715.csv') & (train_data['image'] == '9'), :]
a = d.groupby(['id', 'image', 'action', 'condition']).size().reset_index(name='count')

# 
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
action_counts = test_data.groupby(['id', 'action', 'condition']).size().reset_index(name='count')
action_counts['proportion'] = action_counts['count'] / 48

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

conditions = test_data['condition'].unique()
for i, condition in enumerate(conditions):
    condition_data = action_counts[action_counts['condition'] == condition]
    sns.pointplot(data=condition_data, x='action', y='proportion', hue='id', dodge=True, ax=axes[i])
    axes[i].set_title(f'Condition {condition}')
    axes[i].set_xlabel('Action')
    axes[i].set_ylabel('Relative frequency')
    axes[i].legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()

a = 1