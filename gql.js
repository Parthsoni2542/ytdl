const getVideo = require('./getvid')
const { buildSchema } = require('graphql')
const fs = require('fs')
const path = require('path')

const schema = buildSchema(
	fs.readFileSync(__dirname + '/schema.gql').toString(),
	fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
	fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),

)
exports.schema = schema

const root = {
	search: ({ id }) => getVideo(id)
}
exports.root = root
// graphql(schema, '{search(id:"-tKVN2mAKRI"){stream{quality,url}}}', root).then(r => console.log(r.data.search))
