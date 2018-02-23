declare const _default: {
    createdat: {
        scalar: string;
        meta: {
            name: string;
            formula: ({ id, record }: {
                id: any;
                record: any;
            }) => Date | undefined;
        };
    };
    modifiedat: {
        scalar: string;
        meta: {
            name: string;
            formula: ({ record }: {
                record: any;
            }) => Date | undefined;
        };
    };
};
export default _default;
