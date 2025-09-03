import pandas as pd
import os
import seaborn as sns
import numpy as np
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

# Plot RTs
fig, axes = plt.subplots(1, 2, figsize=(14, 6), sharey=True)
sns.violinplot(ax=axes[0], x='id', y='rt', data=train_data, inner='quartile', cut=0, scale='width', palette=sns.color_palette("tab10", n_colors=train_data['id'].nunique()))
axes[0].set_title('Training: RT per participant')
axes[0].set_xlabel('Participant ID')
axes[0].set_ylabel('Reaction time (rt)')
axes[0].tick_params(axis='x', rotation=90)
sns.violinplot(ax=axes[1], x='id', y='rt', data=test_data, inner='quartile', cut=0, scale='width', palette=sns.color_palette("tab10", n_colors=train_data['id'].nunique()))
axes[1].set_title('Test: RT per participant')
axes[1].set_xlabel('Participant ID')
axes[1].tick_params(axis='x', rotation=90)
axes[1].set_ylabel('')
sns.despine(trim=True)
plt.tight_layout()
plt.show()

# Plot durations
train_data['time_elapsed'] = pd.to_numeric(train_data.get('time_elapsed'), errors='coerce')
test_data['time_elapsed'] = pd.to_numeric(test_data.get('time_elapsed'), errors='coerce')
train_min = train_data.groupby('id')['time_elapsed'].min().rename('min_train')
test_max = test_data.groupby('id')['time_elapsed'].max().rename('max_test')
dur_df = pd.concat([test_max, train_min], axis=1).reset_index()
dur_df['duration'] = (dur_df['max_test'] - dur_df['min_train']) / 60000
plt.figure(figsize=(12, 6))
sns.barplot(x='id', y='duration', data=dur_df, palette=sns.color_palette("tab10", n_colors=train_data['id'].nunique()))
plt.xlabel('Participant ID')
plt.ylabel('Total elapsed time (s) — max(test) - min(train)')
plt.title('Total time per participant')
plt.xticks(rotation=90)
for p in plt.gca().patches:
    height = p.get_height()
    if not np.isnan(height):
        plt.gca().text(p.get_x() + p.get_width() / 2, height + 0.01 * dur_df['duration'].max(),
                       f'{height:.1f}', ha='center', va='bottom', fontsize=8)

plt.tight_layout()

# Plot raw decision data
def plot_raw(pid):
    df = train_data.loc[train_data['id'] == pid].reset_index(drop=True)
    df['y'] = df['action'].apply(lambda a: 1 if a in ['A1', 'A3'] else 0)
    colors = {'A1': 'C0', 'A2': 'C1', 'A3': 'C2', 'A4': 'C3'}

    # Partition into 4 vertical subplots, each showing a quarter of trials
    n = len(df)
    chunk = int(np.ceil(n / 4))
    fig, axes = plt.subplots(4, 1, figsize=(18, 10), sharey=True)

    for i, ax in enumerate(axes):
        start_idx = i * chunk
        end_idx = min((i + 1) * chunk, n)
        df_chunk = df.iloc[start_idx:end_idx].reset_index(drop=True)
        if df_chunk.empty:
            ax.set_visible(False)
            continue
        ax.set_ylim(-0.5, 1.5)
        ax.set_yticks([1, 0])
        ax.set_yticklabels(['A1/A3', 'A2/A4'])
        ax.set_xlabel('Trial index (sequence)' if i == len(axes) - 1 else '')
        ax.tick_params(axis='x', rotation=0)
        if i == 0:
            ax.set_title(f'Participant {pid}')
        ax.hlines(0.5, xmin=df_chunk['trial_index'].min() - 0.5, xmax=df_chunk['trial_index'].max() + 0.5,
                  color='lightgray', linewidth=0.8)

        # block boundaries inside this chunk
        block_starts = df_chunk.loc[df_chunk['block'].ne(df_chunk['block'].shift()), 'trial_index'].dropna().astype(float)
        for x in block_starts:
            ax.vlines(x - 0.5, -0.5, 1.5, color='gray', linestyle='--', linewidth=0.8, alpha=0.7)

        # Put the key text at each trial position
        for _, row in df_chunk.iterrows():
            if np.isnan(row['y']):
                continue
            x = row['trial_index']
            y = row['y']
            key = str(row['response'])
            action = str(row['action'])
            ax.text(x, y, key, ha='center', va='center', fontsize=8, color=colors.get(action, 'k'),
                    bbox=dict(boxstyle='round,pad=0.1', facecolor='white', alpha=0.6, edgecolor='none'))

        ax.set_xlim(df_chunk['trial_index'].min() - 0.5, df_chunk['trial_index'].max() + 0.5)
        ax.tick_params(axis='x', which='both', bottom=True, top=False, labelrotation=90)

    #sns.despine(trim=True, left=False)
    plt.tight_layout()
    plt.savefig(f'data/pilot_4/figures/raw_data_{pid}.pdf')
for i in range(1, 11):
    plot_raw(i)


a = 1