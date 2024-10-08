import mongoose from 'mongoose'
import config from '../../config'
import { TAcademicSemister } from '../academicSemister/academicSemister.interface'
import { AcademicSemister } from '../academicSemister/academicSemister.model'
import { TStudent } from '../student/student.interface'
import { Student } from '../student/student.models'
import { TUser } from './user.interface'
import { User } from './user.model'
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils'
import { AppError } from '../../errors/appError'
import { TFaculty } from '../Faculties/faculty.interface'
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model'
import { Faculty } from '../Faculties/faculty.model'
import { Admin } from '../Admin/admin.model'
import { verifyToken } from '../auth/auth.utils'
import { JwtPayload } from 'jsonwebtoken'
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary'
import { AnyAaaaRecord } from 'dns'

const createStudentIntoDb = async (
  password: string,
  payload: TStudent,
  file: any,
) => {
  // create a user obj

  const userData: Partial<TUser> = {}

  userData.password = password || (config.default_pass as string)

  // set  student role
  userData.role = 'student'
  userData.email = payload.email

  // set manually; generate id

  //  year ,semisterCode 4 digit number

  const admissionSemester = await AcademicSemister.findById(
    payload.admissionSemister,
  )

  if (!admissionSemester) {
    throw new AppError(404, 'Admission Semester not found')
  }

  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDeparment,
  )

  if (!academicDepartment) {
    throw new AppError(404, 'Academic depaartment not found')
  }

  payload.academicFaculty = academicDepartment.academicFaculty

  const session = await mongoose.startSession()

  try {
    session.startTransaction()
    // transiction 1
    userData.id = await generateStudentId(admissionSemester)
    console.log('iam finded id')

    if (file) {
     

      const imageName = `${userData?.id}${payload?.name?.firstName}`
      const path = file?.path

      // send imageto cloudianry

      const uploadImageUrl = await sendImageToCloudinary(imageName, path)
      payload.profileImg = uploadImageUrl?.secure_url as string
    }

    // console.log(secure_url, 'iam secure url');

    //  create a user
    const newUser = await User.create([userData], { session })

    if (!newUser) {
      throw new AppError(404, 'Failed to create new user')
    }

    // create student
    if (!newUser.length) {
      throw new AppError(404, 'Failed to create user')
    }
    payload.id = newUser[0].id
    payload.user = newUser[0]._id

    // create a student (transiction1)
    const newStudent = await Student.create([payload], { session })
    if (!newStudent) {
      throw new AppError(404, 'Failed to create student')
    }

    await session.commitTransaction()
    await session.endSession()
    return newStudent
  } catch (error: any) {
    await session.abortTransaction()
    await session.endSession()
    throw new AppError(404, error)
  }
}

const createFacultyIntoDb = async (
  file: any,
  password: string,
  payload: TFaculty,
) => {
  console.log('iama paylod', payload)

  const userData: Partial<TUser> = {}

  userData.password = password || (config.default_pass as string)
  userData.role = 'faculty'
  userData.email = payload.email
  //  find academic departmanet info
  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment,
  )

  if (!academicDepartment) {
    throw new AppError(400, 'Academic department not found')
  }

  payload.academicFaculty = academicDepartment?.academicFaculty

  const session = await mongoose.startSession()
  try {
    session.startTransaction()
    userData.id = await generateFacultyId()

    if (file) {
      const imageName = `${userData?.id}${payload?.name?.firstName}`
      const path = file?.path

      // send imageto cloudianry

      const { secure_url } = await sendImageToCloudinary(imageName, path)
      payload.profileImg = secure_url as string
    }

    const newUser = await User.create([userData], { session })

    if (!newUser.length) {
      throw new AppError(200, 'Failed to create user')
    }

    payload.id = newUser[0].id
    payload.user = newUser[0]._id
    const newFaculty = await Faculty.create([payload], { session })
    if (!newFaculty.length) {
      throw new AppError(400, 'Failed to create faculty')
    }
    await session.commitTransaction()
    await session.endSession()
    return newFaculty
  } catch (error: any) {
    await session.abortTransaction()
    await session.endSession()
    throw new Error(error)
  }
}

const createAdminIntoDB = async (password: string, payload: TFaculty) => {
  // create a user object
  const userData: Partial<TUser> = {}

  //if password is not given , use deafult password
  userData.password = password || (config.default_pass as string)

  //set student role
  userData.role = 'admin'
  userData.email = payload.email

  const session = await mongoose.startSession()

  try {
    session.startTransaction()
    //set  generated id
    userData.id = await generateAdminId()

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session })

    //create a admin
    if (!newUser.length) {
      throw new AppError(400, 'Failed to create admin')
    }
    // set id , _id as user
    payload.id = newUser[0].id
    payload.user = newUser[0]._id //reference _id

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payload], { session })

    if (!newAdmin.length) {
      throw new AppError(400, 'Failed to create admin')
    }

    await session.commitTransaction()
    await session.endSession()

    return newAdmin
  } catch (err: any) {
    await session.abortTransaction()
    await session.endSession()
    throw new Error(err)
  }
}

const getMe = async (userId: string, role: string) => {
  // const decoded=verifyToken(token,config.jwt_access_secret as string)

  //    console.log(userId,role);
  let result = null
  if (role === 'student') {
    result = await Student.findOne({ id: userId }).populate('user')
  }
  if (role === 'admin') {
    result = await Admin.findOne({ id: userId })
  }
  if (role === 'faculty') {
    result = await Faculty.findOne({ id: userId }).populate('user')
  }

  // const result= await

  return result
}

const changeUserStatusIntoDb = async (
  id: string,
  payload: {
    status: string
  },
) => {
  // const result= await

  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  })

  return result
}

export const UserServices = {
  createStudentIntoDb,
  createFacultyIntoDb,
  createAdminIntoDB,
  getMe,
  changeUserStatusIntoDb,
}
