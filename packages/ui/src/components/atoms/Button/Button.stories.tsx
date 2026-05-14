import { Button } from './Button';

const meta = { title: 'Atoms/Button', component: Button };
export default meta;

export const Default = {
  render: () => <Button>Schedule</Button>,
};

export const Primary = {
  render: () => <Button variant="primary">Start</Button>,
};
