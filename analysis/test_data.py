import numpy as np
import pandas as pd
import os
import seaborn as sns
import matplotlib.pyplot as plt

data_dir = 'data/'
file_names = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
dfs = []
for idx, file_name in enumerate(file_names):
    df = pd.read_csv(os.path.join(data_dir, file_name))
    df['id'] = idx
    dfs.append(df)
data = pd.concat(dfs, ignore_index=True)

plt.figure(figsize=(8, 6))
sns.countplot(data=data.loc[data['phase'] == 'test'], x='action', hue='condition', order=['A1', 'A2', 'A3', 'A4'])
plt.title('Frequency of Actions by Condition')
plt.xlabel('Action')
plt.ylabel('Frequency')
plt.legend(title='Condition')
plt.tight_layout()
plt.show()

data_a1 = data.loc[data['action'] == 'A1']
rew_prob = data.groupby(['action', 'id', 'image'])['reward'].mean()
plt.figure(figsize=(8, 6))
sns.histplot(data=rew_prob.reset_index(), x='reward', hue='action', bins=20)
plt.title('Distribution of Reward Probabilities by Action')
plt.xlabel('Reward Probability')
plt.ylabel('Frequency')
plt.tight_layout()
plt.show()

a = 1