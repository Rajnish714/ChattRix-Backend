// export default {
//   createTransport: jest.fn(() => ({
//     sendMail: jest.fn().mockResolvedValue(true),
//   })),
// };
export default {
  createTransport: () => ({
    sendMail: async () => true
  })
};