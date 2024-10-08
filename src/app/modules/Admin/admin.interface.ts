import { Model, Types } from 'mongoose'

export type TGender = 'Male' | 'Female' | 'Others'
export type TBloodGroup =
'A' | 'B+' | 'B-'|'AB+'|'AB-'|'O+'|'O-'

export type TUserName = {
  firstName: string
  middleName: string
  lastName: string
}

export type TAdmin = {
  id: string
  user: Types.ObjectId
  designation: string
  name: TUserName
  gender: TGender
  dateOfBirth?: Date
  email: string
  contactNo: string
  emergencyContactNo: string
  bloogGroup?: TBloodGroup
  presentAddress: string
  permanentAddress: string
  profileImg?: string
  isDeleted: boolean
}

export interface adminModel extends Model<TAdmin> {
  isUserExists(id: string): Promise<TAdmin | null>
}
