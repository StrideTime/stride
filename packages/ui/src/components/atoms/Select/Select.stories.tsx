import { useState } from 'react';

import { Select } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
};

export default meta;

export const Default = {
  render: () => {
    const [value, setValue] = useState('all');

    return (
      <Select
        label="Assignee"
        value={value}
        onChange={setValue}
        options={[
          { value: 'all', label: 'Everyone' },
          { value: 'mine', label: 'Mine' },
          { value: 'unassigned', label: 'Unassigned' },
        ]}
      />
    );
  },
};
