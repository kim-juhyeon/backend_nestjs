import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly MovieRepository: Repository<Movie>,
  ) {}

  getManyMovies(title?: string) {
    return this.MovieRepository.find();
    // console.log(this.movies);
    // if (!title) {
    //   return this.movies;
    // }
    // return this.movies.filter((m) => m.title.startsWith(title));
  }

  async getMovieById(id: number) {
    const movie = await this.MovieRepository.findOne({
      where: {
        id,
      },
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }
    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    const movie = await this.MovieRepository.save(createMovieDto);

    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.MovieRepository.findOne({
      where: {
        id,
      },
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }
    await this.MovieRepository.update({ id }, updateMovieDto);
    const newMovie = await this.MovieRepository.findOne({
      where: {
        id,
      },
    });

    return movie;
  }
  async deleteMovie(id: number) {
    const movie = await this.MovieRepository.findOne({
      where: {
        id,
      },
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }
    await this.MovieRepository.delete(id);
    return id;
  }
}
