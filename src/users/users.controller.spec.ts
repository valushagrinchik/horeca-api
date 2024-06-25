import { UserRole } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('CatsController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
    usersController = new UsersController(usersService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const user = {
        id: 123,
        role: UserRole.Horeca,
        name: 'Test',
        tin: 'Test',
        email: 'test@test.test', 
        phone: '123', 
        password: '123', 
        createdAt: new Date(),
        updatedAt: new Date(),
        activationLink: '',
        profile: null
      }

      jest.spyOn(usersService, 'get').mockImplementation(() => Promise.resolve(user));

      expect(await usersController.get({id: 123})).toBe(user);
    });
  });
});