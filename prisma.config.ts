import { defineConfig } from 'prisma/config';

export default defineConfig({
    datasource: {
        url: 'file:./ikabu.sqlite3',
    },
});
