import { AcademicDepartment } from './../academicDepartment/academicDepartment.model'
import { Course } from './../courses/course.model'
import { AppError } from '../../errors/appError'
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model'
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model'
import { SemesterRegistration } from '../semisterRegistration/semisterRegistration.model'
import { TOfferedCourse } from './offerdCourse.interface'
import { OfferedCourse } from './offerdCourse.model'
import { Faculty } from '../Faculties/faculty.model'
import { hasTimeConflict } from './offeredCourse.utils'
import QueryBuilder from '../../builder/QueryBuilder'

const createOfferCourseIntoDb = async (payload: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicDepartment,
    academicFaculty,
    course,
    section,
    faculty,
    days,
    startTime,
    endTime,
  } = payload
  // check if the semester registraiton id is exist
  const isSemesterRegistrationExist =
    await SemesterRegistration.findById(semesterRegistration)

  if (!isSemesterRegistrationExist) {
    throw new AppError(404, 'Semester registration not found')
  }

  const academicSemester = isSemesterRegistrationExist.academicSemester

  const isAcademicFacultyExist = await AcademicFaculty.findById(academicFaculty)

  if (!isAcademicFacultyExist) {
    throw new AppError(404, 'Academic  Faculty not found')
  }

  const isAcademicDepartmentExist =
    await AcademicDepartment.findById(academicDepartment)

  if (!isAcademicDepartmentExist) {
    throw new AppError(404, 'Academic  Department not found')
  }

  const isCourseExist = await Course.findById(course)

  if (!isCourseExist) {
    throw new AppError(404, 'Course not found')
  }

  const isFaculty = await Faculty.findById(faculty)

  if (!isFaculty) {
    throw new AppError(404, 'Faculty not found')
  }

  //    check does academicFaculty is belong to academicFaculty

  const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty: academicFaculty,
  })

  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      404,
      `this ${isAcademicDepartmentExist.name} not found in ${isAcademicFacultyExist.name}`,
    )
  }

  const isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection =
    await OfferedCourse.findOne({
      semesterRegistration,
      course,
      section,
    })
  if (isSameOfferedCourseExistsWithSameRegisteredSemesterWithSameSection) {
    throw new AppError(400, 'Offered course with same section already exist')
  }

  //   get the schedule of the faculties
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime')

  const newSchedule = {
    days,
    startTime,
    endTime,
  }

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      400,
      'This Faculty is not available at that time ! Choose other time',
    )
  }

  const result = await OfferedCourse.create({ ...payload, academicSemester })
  return result
}

const getAllOfferedCoursesFromDB = async (query: Record<string, unknown>) => {
    const offeredCourseQuery = new QueryBuilder(OfferedCourse.find(), query)
      .filter()
      .sort()
      .paginate()
      .fields();
  
    const result = await offeredCourseQuery.modelQuery;
    return result;
  };

  const getSingleOfferedCourseFromDB = async (id: string) => {
    const offeredCourse = await OfferedCourse.findById(id);
  
    if (!offeredCourse) {
      throw new AppError(404, 'Offered Course not found');
    }
  
    return offeredCourse;
  };
  





const updateOfferedCourseIntoDB = async (
  id: string,
  payload: Pick<TOfferedCourse, 'faculty' | 'days'|'startTime' | 'endTime'>,
) => {
  const { faculty,days,startTime,endTime } = payload
  const isOfferedCourseExist = await OfferedCourse.findById(id)
  if (!isOfferedCourseExist) {
    throw new AppError(404, 'offered course not found')
  }



  const isFacultyExist = await Faculty.findById(faculty)
  if (!isFacultyExist) {
    throw new AppError(404, 'Faculty  not found')
  }

const  semesterRegistration= isOfferedCourseExist.semesterRegistration

 

const semesterRegistrationStatus=await SemesterRegistration.findById(semesterRegistration)
if (semesterRegistrationStatus?.status !=='UPCOMING') {
    throw new AppError(
        400,
        `You cannot update ths offered course as it is ${semesterRegistrationStatus?.status}`,
      )
}

  //   get the schedule of the faculties
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime')

  const newSchedule = {
    days,
    startTime,
    endTime,
  }

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      400,
      'This Faculty is not available at that time ! Choose other time',
    )
  }


   const result= await OfferedCourse.findByIdAndUpdate(id,payload,{
    new:true
   })

   return result







}

const deleteOfferCourseFromDb= async (id:string)=>{
    const isOfferedCourseExist=await OfferedCourse.findById(id);
    if (!isOfferedCourseExist) {
         throw new AppError(400,'Offered course not found')
    }
    const semesterRegistation= isOfferedCourseExist.semesterRegistration;
    const semesterRegistrationStatus=await SemesterRegistration.findById(semesterRegistation).select('status')
    if (semesterRegistrationStatus?.status !=='UPCOMING') {
        throw new AppError(400,'Offered course can not be updated becaute the sumeste is ongoing or ended')
    }

    const result= await OfferedCourse.findByIdAndDelete(id)
    return result
    
}

export const OfferdCourseServices = {
  createOfferCourseIntoDb,
  getAllOfferedCoursesFromDB,
  getSingleOfferedCourseFromDB,
  updateOfferedCourseIntoDB,
  deleteOfferCourseFromDb
}
