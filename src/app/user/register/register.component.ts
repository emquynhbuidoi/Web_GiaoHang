import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChucVu } from 'src/app/models/chucVu';
import { TaiKhoan } from 'src/app/models/taiKhoan';
import { User } from 'src/app/models/user';
import { KHService } from 'src/services/khachhang.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  processing = false;
  f!: FormGroup
  khachhang!: User
  taiKhoan!: TaiKhoan
  gioitinh = ["Nam", "Nữ"]


  constructor(private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private khService: KHService
  ) { }

  ngOnInit(): void {
    this.f = new FormGroup({
      maTK: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      matKhau: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      sdt: new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
      gioiTinh: new FormControl(null, Validators.required),
      diaChi: new FormControl(null, Validators.required),
      ngaySinh: new FormControl(null, [Validators.required, this.minimumAgeValidator(18)]),
      hoTen: new FormControl(null, Validators.required),
      trangThaiTK: new FormControl(null, Validators.required),
    })
  }

  minimumAgeValidator(minimumAge: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value === null || control.value === '') {
        return null;
      }
      const today = new Date();
      const birthDate = new Date(control.value);
      const age = today.getFullYear() - birthDate.getFullYear();
  
      if (age < minimumAge || age >= 70) {
        return { 'underAge': true };
      }
  
      return null;
    };
  }

  Register() {
    this.processing = true;
    const value = this.f.value
    //Tạo tài khoản khách hàng
    var cv = new ChucVu(0, "")
    this.taiKhoan = new TaiKhoan(0, value.email, value.matKhau, value.sdt,
      value.gioiTinh, value.diaChi, value.ngaySinh, value.hoTen, "Còn Hoạt Động", 2, cv, "")

    //Tạo 1 khách hàng mới
    this.khachhang = new User(0, value.email, value.matKhau, "", this.taiKhoan);

    //Test JSON
    // console.log(JSON.stringify(this.taiKhoan))
    // console.log(JSON.stringify(this.khachhang))

    this.khService.addKH(this.khachhang)
      .subscribe({
        next: (res) => {
          this.processing = false;
          this.f.reset()
          this.toastr.success("Đăng Ký Thành Công", "Thông báo", {
            progressBar: true,
            newestOnTop: true
          })
          this.router.navigate(['/login'], { relativeTo: this.route })

        },
        error: (err) => {
          this.processing = false;
          this.toastr.error("Khách hàng đã tồn tại!", "Thông báo", {
            progressBar: true,
            newestOnTop: true
          })
        }
      })
  }


}
