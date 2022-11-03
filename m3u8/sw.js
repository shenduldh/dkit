/* 
    I'm a serviceWorker.
    意义: 让浏览器支持流式下载
    原理: 发出 url 请求, 若该请求的响应类型为 application/octet-stream, 则会触发浏览器下载,
        而且当传入 responseWith 的 new Response 是 stream 时, 浏览器就会以流式的方式下载它
    过程: 该 serviceWorker 在整个下载过程会被触发两次, 一次是在 onMessage 监听初始化消息, 创建读取流,
        一次是 onFetch 拦截请求, 用于触发下载, 让浏览器去下载读取流中的数据. 之后我们只需往读取流中不断塞入数据,
        浏览器就会不断把数据下载下来, 直到关闭读取流
    题外话: StreamSaver.js 创建了一个 messageChannel 和 ReadableStream,
        messageChannel 用于和 serviceWorker 通信, ReadableStream 用于完成流式下载
*/

self.addEventListener('install', () => {
    // 跳过等待环节, 直接让当前 worker 为活跃状态
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    // 将当前 worker 设置为所有 clients 的控制器, 即从旧的 worker 中将控制权拿过来
    event.waitUntil(self.clients.claim())
})


// url 与 data 的映射
const urlDataMap = new Map()


// 监听消息
self.onmessage = event => {
    const data = event.data // 传输的数据

    // 跳过 keep alive ping
    if (data === 'ping') return

    // 用于触发数据下载的 url
    const downloadUrl = data.url || self.registration.scope + Math.random() + '/' + (typeof data === 'string' ? data : data.filename)
    const port = event.ports[0]  // channelPort
    const metadata = new Array(3) // [stream, data, port]
    metadata[1] = data
    metadata[2] = port

    if (data.readableStream) {
        metadata[0] = data.readableStream
    } else if (data.transferringReadable) { 
        // 如果支持双向流, 则用其完成数据传输, 同时结束与 messageChannel 的通信
        port.onmessage = evt => {
            port.onmessage = null
            metadata[0] = evt.data.readableStream
        }
    } else
        // 如果没有外部传入的 readableStream, 则自己创建一个
        metadata[0] = createStream(port)

    // 进行数据与 url 的映射记录
    urlDataMap.set(downloadUrl, metadata)

    // 进行消息响应, 返回下载地址
    port.postMessage({ download: downloadUrl })
}


// 创建数据读取流
function createStream(port) {
    return new ReadableStream({
        start(controller) {
            // 监听 messageChannel 发送来的数据, 然后写入
            port.onmessage = ({ data }) => {
                if (data === 'end') return controller.close()

                if (data === 'abort') {
                    controller.error('Aborted the download')
                    return
                }

                controller.enqueue(data)
            }
        },
        cancel(reason) {
            console.log('user aborted', reason)
            port.postMessage({ abort: true })
        }
    })
}


// 拦截下载请求
self.onfetch = event => {
    const url = event.request.url

    // 听到 ping, 返回 pong
    if (url.endsWith('/ping')) return event.respondWith(new Response('pong'))

    const cacheData = urlDataMap.get(url) // 获取之前缓存的 url 映射的信息

    if (!cacheData) return null

    const [stream, data, port] = cacheData

    urlDataMap.delete(url)

    // 构造响应头, 并只获取外部传入的 Content-Length 和 Content-Disposition 这两个响应头
    const responseHeaders = new Headers({
        'Content-Type': 'application/octet-stream; charset=utf-8', // 将响应格式设置为二进制流
        // 一些安全设置
        'Content-Security-Policy': "default-src 'none'",
        'X-Content-Security-Policy': "default-src 'none'",
        'X-WebKit-CSP': "default-src 'none'",
        'X-XSS-Protection': '1; mode=block'
    })

    let headers = new Headers(data.headers || {})

    // 设置长度
    if (headers.has('Content-Length')) responseHeaders.set('Content-Length', headers.get('Content-Length'))

    // 设置回复的内容该以何种形式展示, 是以内联的形式 (即网页或者页面的一部分),
    // 还是以附件的形式下载并保存到本地
    if (headers.has('Content-Disposition')) responseHeaders.set('Content-Disposition', headers.get('Content-Disposition'))

    // 针对该请求进行响应
    event.respondWith(new Response(stream, { headers: responseHeaders }))

    port.postMessage({ debug: 'Download started' })
}
