import { MagnifyingGlassIcon } from '@phosphor-icons/react';

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
      leading={<MagnifyingGlassIcon size={16} weight="bold" />}
    />
  ),
};
