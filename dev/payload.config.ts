import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { dashboardAnalytics } from 'payload-dashboard-analytics'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'

import { devUser } from './helpers/credentials.js'
import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export default buildConfig({
  admin: {
    autoLogin: devUser,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'posts',
      fields: [],
    },
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  editor: lexicalEditor(),
  email: testEmailAdapter,
  onInit: async (payload) => {
    await seed(payload)
  },
  plugins: [
    dashboardAnalytics({
      provider: {
        source: 'google',
        propertyId: '483744846',
        credentials: './credentials.json',
      },
      cache: true,
      navigation: {
        afterNavLinks: [
          {
            type: 'live',
          },
        ],
      },
      dashboard: {
        beforeDashboard: ['viewsChart'],
        afterDashboard: ['topPages'],
      },

      globals: [
        {
          slug: 'home',
          widgets: [
            {
              type: 'info',
              label: 'Page data',
              metrics: ['views', 'sessions', 'sessionDuration'],
              timeframe: 'currentMonth',
              idMatcher: () => '/',
            },
          ],
        },
      ],

      collections: [
        {
          slug: 'posts',
          widgets: [
            {
              type: 'chart',
              label: 'Views an visitors',
              metrics: ['views', 'sessions', 'visitors'],
              timeframe: '30d',
              idMatcher: (doc) => {
                return `/blog/${doc.slug}`
              },
            },
          ],
        },
      ],
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
