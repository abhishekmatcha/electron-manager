import { ipc } from '../../../../../lib';

ipc.respond('CHANNEL_1', (evt, data) => {
  console.log(data);

  return new Promise((resolve) => {
      resolve('This a test output')
  });
});
