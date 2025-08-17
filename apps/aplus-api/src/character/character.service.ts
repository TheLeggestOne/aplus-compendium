import { Injectable } from '@nestjs/common/';
import { characterRepository } from '@aplus-orm/';
import { Character } from './character.entity';

@Injectable()
export class CharacterService {
  @Get(':id')
  async getCharacterById(@Param('id') id: string): Promise<Character> {
    return this.characterRepository.findOne(id);
  }
}
