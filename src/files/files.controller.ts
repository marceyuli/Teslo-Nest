import { BadRequestException, Controller, Get, Param, Post, StreamableFile, UploadedFile, UseInterceptors} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';

import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService) {}

  @Get('product/:imageName')
  findProducttImage(
    @Param ('imageName') imageName: string,
  ) {
    //return this.filesService.getStaticProductImage(imageName);
     const path = createReadStream(this.filesService.getStaticProductImage(imageName)); 
     return new StreamableFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer,
    })
  }))
  
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
      
      if(!file){
        throw new BadRequestException('Make sure that the file is an image')
      }

      const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;
      
      return {
        secureUrl
      }
  }
}
