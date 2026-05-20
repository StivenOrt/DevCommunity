import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FriendshipStatus } from 'src/common/enums/friend.enum';

export class UpdateFriendStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la relación de amistad',
    enum: [FriendshipStatus.ACCEPTED, FriendshipStatus.REJECTED],
    example: FriendshipStatus.ACCEPTED,
  })
  @IsEnum([FriendshipStatus.ACCEPTED, FriendshipStatus.REJECTED])
  @IsNotEmpty()
  status: FriendshipStatus.ACCEPTED | FriendshipStatus.REJECTED;
}
