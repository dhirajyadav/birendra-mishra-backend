export default ({ env }: { env: any }) => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100 * 1024 * 1024, // 100MB
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
  ckeditor: {
    enabled: true,
  },
});

