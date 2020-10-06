
const Koa = require('koa')
const koaBody = require('koa-body')
const mount = require('koa-mount')
const graphqlHTTP = require('koa-graphql')
const { RateLimiterMemory } = require('rate-limiter-flexible')
const app = new Koa()
const getVideo = require('./getvid')
const gql = require('./gql')
const path = require('path')
const https = require('https')
const fs = require('fs')
const http = require('http');

const forceHTTPS = require('koa-force-https');
// app.use(forceHTTPS());
// app.use(forceHTTPS(undefined, 'localhost', 307));


app.proxy = true
app.use(koaBody())
app.use(forceHTTPS());



// cors
app.use(async (ctx, next) => {
	await next()
	ctx.set('Access-Control-Allow-Origin', '*')
})

// gql
app.use(
	mount(
		'/graphql',
		graphqlHTTP({
			schema: gql.schema,
			rootValue: gql.root,
			graphiql: true
		})
	)
)

// response time
app.use(async (ctx, next) => {
	const start = Date.now()
	await next()
	const ms = Date.now() - start
	ctx.set('X-Response-Time', `${ms}ms`)
})

// format
app.use(async (ctx, next) => {
	await next()
	const { format } = ctx.request.query
	if (format) {
		ctx.body = JSON.stringify(ctx.body, null, 2)
	}
})

// api
app.use(async ctx => {
	if (ctx.path === '/api') {
		const { id } = ctx.request.query
		if (!id) {
			ctx.throw(400, 'id required')
			return
		}
		try {
			ctx.body = await getVideo(id)
		} catch (e) {
			ctx.body = e
		}
	}
})



var https_options = {
	key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),

};

app.use(forceHTTPS());





// const appCallback = app.callback();


// http.createServer(app.callback())).listen(3000)
//  function (req, res) {a
// res.writeHead(200);
// res.end("Welcome to Node.js HTTPS Servern");
// app.get('/api').
// }

http.createServer(app.callback()).listen(80);
https.createServer(https_options, app.callback()).listen(443);
// http.createServer(.listen(80);
// https.createServer(https_options,appCallback).listen(3000)
// http.createServer(https_options,appCallback).listen(3001)

// const PORT = process.env.PORT || 3000

// if (https.createServer(https_options,appCallback).listen(3000)) {

// }
// // sslServer.listen(PORT, () => console.log(`listen on: http://localhost:${PORT}`))
// app.listen(PORT, () => console.log(`listen on: http://localhost:${PORT}`))
