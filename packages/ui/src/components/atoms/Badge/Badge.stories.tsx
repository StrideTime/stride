import { Badge } from './Badge';

const meta = { title: 'Atoms/Badge', component: Badge };
export default meta;

export const Default = {
  render: () => <Badge>Ready</Badge>,
};

export const Danger = {
  render: () => <Badge variant="danger">Blocked</Badge>,
};
