import { MagnifyingGlass } from '@phosphor-icons/react';

import { TextInput } from './TextInput';

const meta = { title: 'Atoms/TextInput', component: TextInput };
export default meta;

export const Default = {
  render: () => <TextInput aria-label="Search" placeholder="Search" />,
};

export const WithLeading = {
  render: () => (
    <TextInput
      aria-label="Search"
      placeholder="Search"
      leading={<MagnifyingGlass size={16} weight="bold" />}
    />
  ),
};
