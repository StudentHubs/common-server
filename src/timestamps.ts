export default {
  createdat: {
    scalar: 'date',
    meta: {
      name: 'Created at',
      formula: ({ id, record }) => {
        if (!id && !record.createdat) return new Date();
      },
    },
  },
  modifiedat: {
    scalar: 'date',
    meta: {
      name: 'Modified at',
      formula: ({ record }) => {
        if (!record.modifiedat) return new Date();
      },
    },
  },
};
