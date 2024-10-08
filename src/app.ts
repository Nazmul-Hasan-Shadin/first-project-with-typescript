/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import cors from 'cors'
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  request,
} from 'express'
import { StudentRoutes } from './app/modules/student/student.route'
import { UserRoutes } from './app/modules/user/user.routes'
import globalErrorHandler from './app/middleware/globalErrorHandler'
import notFound from './app/middleware/notFound'
import router from './app/routes'
import cookieParser from 'cookie-parser'

const app: Application = express()

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials:true
  }),
)

// application routes

app.use('/api/v1', router)

// const test=async(req:Request,res:Response)=>{
//   Promise.reject()
// }

// app.use('/',test)

// app.get('/', (req: Request, res: Response) => {
//   const a = 23
//   res.send(a)
// })

app.use(globalErrorHandler)

// not found
app.use(notFound)

export default app
