import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/roles.enum';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Lấy ra các vai trò yêu cầu từ metadata của Route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Nếu không có vai trò nào được yêu cầu, cho phép truy cập
    }

    // 2. Lấy thông tin người dùng từ request (đã được gắn bởi JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    // Lưu ý: Đối tượng user phải có thuộc tính role hoặc roles (ví dụ: user.role = 'admin')

    // 3. So sánh vai trò yêu cầu và vai trò của người dùng
    return requiredRoles.some((role) => user.role === role);
    // Nếu người dùng có bất kỳ vai trò nào trong danh sách yêu cầu, trả về true.
  }
}
