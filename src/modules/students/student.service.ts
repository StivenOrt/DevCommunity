import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './entities/stundent.entity';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
  ) {}

  create(dto: CreateStudentDto): Promise<StudentEntity> {
    const student = this.studentRepository.create(dto);
    return this.studentRepository.save(student);
  }

  findAll(): Promise<StudentEntity[]> {
    return this.studentRepository.find();
  }
}