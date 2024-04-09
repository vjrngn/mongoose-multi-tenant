const mongoose = require('mongoose');
import { getModelForClass as modelForClass } from "@typegoose/typegoose";
import { Post } from "./models/Post";

/**
 * const mongoose = require('@greenpass-venture/mongoose')
 *
 * const db = db('orgId')
 * db.model('Project').find();
 */

const clusterMap: Record<string, string> = {
  'org_1': 'mongodb://0.0.0.0:27018/blog',
  'org_2': 'mongodb://0.0.0.0:27019/blog'
}

// DB Select Service
async function getConnectionString(orgId: string) {
  return clusterMap[orgId];
}

async function db(orgId: string) {
  const _cache = new Map();

  if (_cache.has(orgId)) {
    return _cache.get(orgId);
  }

  const connString = await getConnectionString(orgId);

  if (!connString) {
    throw new Error(`Org ${orgId} not authorised to connect to database`); // or whatever
  }

  const conn = await mongoose.connect(connString, {
    authSource: "admin",
    auth: {
      username: "root",
      password: "example"
    },
  });

  _cache.set(orgId, conn);

  return conn;
}

async function getModelForClass(clazz: any, options: { orgId: string }) {
  const conn = await db(options.orgId);

  return modelForClass(clazz, {
    existingConnection: conn
  });
}

(async() => {
  // const conn = await db('org_1');
  // const posts = await conn.model('Post').find();
  const PostModel = await getModelForClass(Post, {
    orgId: 'org_1'
  });

  // console.log(await PostModel.find());
  process.exit(0);
})()
