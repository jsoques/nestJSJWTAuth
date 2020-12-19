import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {

    // https://www.w3resource.com/javascript/form/email-validation.php
    @IsString()
    @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, { message: 'must be a valid email' })
    email: string;

    // Password REGEX
    // https://gist.github.com/arielweinberger/18a29bfa17072444d45adaeeb8e92ddc
    // Passwords will contain at least 1 upper case letter
    // Passwords will contain at least 1 lower case letter
    // Passwords will contain at least 1 number or special character
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password to weak' })
    password: string;

}