import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()


app.use(cors({
    origin: [process.env.CORS_ORIGIN || 1000],
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit:'16kb'}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.routes.js'
import videorouter from './routes/video.routes.js'
import tweetrouter from './routes/tweet.routes.js'
import likerouter from './routes/like.routes.js'
import commentrouter from './routes/comment.routes.js'
import subscriptionrouter from './routes/subscription.routes.js'
import playlistrouter from './routes/playlist.routes.js'
import dashboardrouter from "./routes/dashboard.routes.js"



//routes declaration 
app.use("/api/v1/users", userRouter)
app.use("/api/v1",videorouter)
app.use("/api/v1", tweetrouter)
app.use("/api/v1", likerouter)
app.use("/api/v1", commentrouter)
app.use("/api/v1", subscriptionrouter)
app.use("/api/v1", playlistrouter)
app.use("/api/v1", dashboardrouter)


export { app } 