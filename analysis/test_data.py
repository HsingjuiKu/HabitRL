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

# Check completeness
for i in data['id'].unique():
    print(f"{i} train: {len(train_data.loc[train_data['id'] == i, :])}; test: {len(test_data.loc[test_data['id'] == i, :])}")

# Attention check accuracy
attention_check_data = data[data['attention_check'] == True]
attention_check_accuracy = attention_check_data.groupby(['id']).apply(
    lambda x: (x['response'] == x['image']).mean()
).reset_index(name='accuracy')
attention_check_accuracy = attention_check_accuracy.sort_values('accuracy', ascending=False)
print(attention_check_accuracy.loc[attention_check_accuracy['accuracy'] < .8, 'id'])

fig, ax = plt.subplots(figsize=(10, 6))
low_acc_ids = attention_check_accuracy[attention_check_accuracy['accuracy'] < 0.8]['id'].values
palette = []
tab20_colors = sns.color_palette("tab20", n_colors=len(low_acc_ids))
for i, id_val in enumerate(attention_check_accuracy['id'].values):
    if id_val in low_acc_ids:
        palette.append(tab20_colors[list(low_acc_ids).index(id_val) % len(tab20_colors)])
    else:
        palette.append('lightgray')

sns.barplot(
    data=attention_check_accuracy.reset_index(drop=True),
    x=attention_check_accuracy.reset_index().index,
    y='accuracy',
    palette=palette,
    ax=ax
)
ax.axhline(0.8, color='red', linestyle='--', linewidth=1)
ax.set_xlabel('ID')
ax.set_xticklabels(attention_check_accuracy['id'].values)
ax.set_ylabel('Attention Check Accuracy')
ax.set_title('Attention Check Accuracy')
plt.tight_layout()
plt.show()

# Performance during training phase
train_data['correct'] = train_data['action'].isin(['A1', 'A3']).values
subset = train_data[train_data['s_count'] > 4]
prop_correct_per_id = subset.groupby('id')['correct'].mean().reset_index(name='prop_correct')
prop_correct_per_id = prop_correct_per_id.sort_values('prop_correct', ascending=False).reset_index(drop=True)
print(prop_correct_per_id.loc[prop_correct_per_id['prop_correct'] < .6, 'id'])

fig, ax = plt.subplots(figsize=(10, 6))
sns.barplot(data=prop_correct_per_id, x=prop_correct_per_id.index, y='prop_correct', ax=ax)
ax.set_xticklabels(prop_correct_per_id['id'].values)
ax.set_xlabel('Index')
ax.set_ylabel('')
ax.set_title('Performance training phase')
ax.set_ylim(0, 1)

for p in ax.patches:
    height = p.get_height()
    ax.annotate(f'{height:.2f}', (p.get_x() + p.get_width() / 2., height),
                ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.show()

# Exclude ids
excl_id = attention_check_accuracy.loc[attention_check_accuracy['accuracy'] < .85, 'id'].values
#excl_id = prop_correct_per_id.loc[prop_correct_per_id['prop_correct'] < .8, 'id']
exclude_ids = excl_id
data = data[~data['id'].isin(exclude_ids)].copy()
train_data = train_data[~train_data['id'].isin(exclude_ids)].copy()
test_data = test_data[~test_data['id'].isin(exclude_ids)].copy()

# Plot learning curves
prop_data = train_data.groupby(['id', 'condition', 's_count', 'action']).size().unstack(fill_value=0).reset_index()
prop_data['A1_over_A2'] = prop_data['A1'] / (prop_data['A1'] + prop_data['A2'])
prop_data['A3_over_A4'] = prop_data['A3'] / (prop_data['A3'] + prop_data['A4'])

fig, axs = plt.subplots(2, 2, figsize=(10, 6))
for i, condition in enumerate([0, 1]):
    limit = 25 if condition == 0 else 40
    plot_df = prop_data.loc[prop_data['condition'] == condition, :]
    #axs[0, i].axhline(0.93, linestyle='--')
    sns.lineplot(data=plot_df.loc[plot_df['s_count'] <= 25], 
                 x='s_count', y='A1_over_A2', marker='o',
                 dashes=False, ax=axs[0, i])
    axs[0, i].set_title(f'N(A3)={15 if condition == 0 else 30}')
    axs[0, i].grid(True, linestyle='--', alpha=0.5)
    axs[0, i].set_ylim((.5, 1))

    #axs[1, i].axhline(0.73, linestyle='--')
    sns.lineplot(data=plot_df.loc[plot_df['s_count'] <= limit], 
                 x='s_count', y='A3_over_A4', marker='o',
                 dashes=False, ax=axs[1, i])
    
    axs[1, i].grid(True, linestyle='--', alpha=0.5)
    axs[1, i].set_ylim((.5, 1))
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
action_counts['proportion'] = action_counts['count'] / 32

fig, axes = plt.subplots(1, 2, figsize=(16, 6))
order = ['A1', 'A2', 'A3', 'A4']
for c in [0, 1]:
    condition_data = action_counts[action_counts['condition'] == c]
    sns.boxplot(data=condition_data, x='action', y='proportion', order=order, ax=axes[c], color='lightgray', showcaps=True)
    sns.stripplot(data=condition_data, x='action', y='proportion', order=order, ax=axes[c], jitter=True, 
                  size=6, palette=sns.color_palette("tab20", n_colors=test_data['id'].nunique()))
    axes[c].set_title(f'N(A3) = {15 if c == 0 else 30}')
    axes[c].set_xlabel('Action')
    axes[c].set_ylabel('Frequency')

plt.tight_layout()
plt.savefig('analysis/figures/effect_testphase.pdf')
plt.show()

# Plot test phase accuracy
a1_a3 = action_counts[action_counts['action'].isin(['A1', 'A3'])].copy()
a1_a3_summary = (
    a1_a3.groupby(['id', 'condition'])['proportion']
    .sum()
    .reset_index(name='prop_A1_A3')
)

fig, axes = plt.subplots(1, 2, figsize=(16, 6))

sns.boxplot(
    data=a1_a3_summary, x='condition', y='prop_A1_A3',
    color='lightgray', showcaps=True, showfliers=False, width=0.5, ax=axes[0]
)
sns.stripplot(
    data=a1_a3_summary, x='condition', y='prop_A1_A3',
    jitter=True, size=7,
    palette=sns.color_palette("tab20", n_colors=a1_a3_summary['id'].nunique()),
    ax=axes[0]
)
axes[0].axhline(0.5, color='black', linestyle='--', linewidth=1)
axes[0].set_xlabel('Condition')
axes[0].set_ylabel('Rel. Frequency')
axes[0].set_title('Test Phase "Accuracy"')
axes[0].set_ylim((0, 1))
axes[0].set_xticks([0, 1])
axes[0].set_xticklabels(['N(A3) = 15', 'N(A3) = 30'])
axes[0].get_legend().remove()

# Plot A1 over A3
a1_a3_pivot = a1_a3.pivot_table(index=['id', 'condition'], columns='action', values='proportion', fill_value=0).reset_index()
a1_a3_pivot['A1_minus_A3'] = a1_a3_pivot['A1'] - a1_a3_pivot['A3']

sns.boxplot(
    data=a1_a3_pivot, x='condition', y='A1_minus_A3',
    color='lightgray', showcaps=True, showfliers=False, width=0.5, ax=axes[1]
)
sns.stripplot(
    data=a1_a3_pivot, x='condition', y='A1_minus_A3',
    jitter=True, size=7,
    palette=sns.color_palette("tab20", n_colors=a1_a3_pivot['id'].nunique()),
    ax=axes[1]
)
axes[1].axhline(0, color='black', linestyle='--', linewidth=1)
axes[1].set_xlabel('Condition')
axes[1].set_ylabel('Diff. Rel. Frequency')
axes[1].set_title('P(A1) minus P(A3)')
axes[1].set_xticks([0, 1])
axes[1].set_xticklabels(['N(A3) = 15', 'N(A3) = 30'])
axes[1].legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()


# Calculate proportion of A1 over A2 and A3 over A4 in train_data where sub_trial == 0, per participant
sub_trial_zero = train_data[train_data['sub_trial'] == 0]
counts = sub_trial_zero.groupby(['id'])['action'].value_counts().unstack(fill_value=0)
counts['A1_over_A2'] = counts['A1'] / (counts['A1'] + counts['A2'])
counts['A3_over_A4'] = counts['A3'] / (counts['A3'] + counts['A4'])
sns.stripplot(data=counts, y='A1_over_A2')
sns.stripplot(data=counts, y='A3_over_A4')
plt.tight_layout()
plt.show()

# Plot exploration
action_counts_train = train_data.groupby(['id', 'action', 'condition']).size().reset_index(name='count')
fig, axes = plt.subplots(1, 2, figsize=(16, 6))

conditions = train_data['condition'].unique()
for i, condition in enumerate(conditions):
    condition_data = action_counts_train[action_counts_train['condition'] == condition]
    sns.pointplot(data=condition_data, x='action', y='count', hue='id', dodge=True, ax=axes[i], palette=sns.color_palette("tab10", n_colors=train_data['id'].nunique()))
    axes[i].set_title(f'{condition}')
    axes[i].set_xlabel('Action')
    axes[i].set_ylabel('Frequency')
    axes[i].legend(title='ID', bbox_to_anchor=(1.05, 1), loc='upper left')

plt.tight_layout()
plt.show()

a = 1