import { Schema, model } from 'mongoose'


import { TAcademicDepartment } from './academicDepartment.interface'
import { AppError } from '../../errors/appError'

const academicDepartmentSchema = new Schema<TAcademicDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    academicfaculty: {
      type: Schema.Types.ObjectId,
      ref:'AcademicFaculty'
    },
  },
  {
    timestamps: true,
  },
)

// academicDepartmentSchema.pre('save',async function(next){
//   const isDepartmentExist = await AcademicDepartment.findOne({
//     name: this.name,
//   })

//   if (isDepartmentExist) {
//     throw new Error('This Departmen is already exists')
//   }

//   next()
// })



 academicDepartmentSchema.pre('findOneAndUpdate',async function(next){
  const query=this.getQuery() //here i get _id
  const isDepartmentExist = await AcademicDepartment.findOne(query)
   if (!isDepartmentExist) {
    throw new AppError(404,'This department does not exist !')
   }

   next()
 })



export const AcademicDepartment = model<TAcademicDepartment>(
  'AcademicDepartment',
  academicDepartmentSchema,
)
