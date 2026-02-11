import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom"
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";

const Auth = ({ type = "Login", onSubmit }) => {

    const [data, setData] = useState({ authType: "user", email: "", password: "", confirmPassword: "", fullName: "", phone: "" });
    const [eye, setEye] = useState(false);
    const [eyeConfirm, setEyeConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const validateEmail = (email) => {
        const regex = /^\S+@\S+\.\S+$/;   
        return regex.test(email) ? "" : "Invalid email address";   
    };

    const validatePassword = (password, isRegister = false) => {
        if (!password) return "Password is required";
        if (password.length < 8) return "Password must be at least 8 characters";
        if (isRegister) {
            const strongRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/;   
            if (!strongRegex.test(password)) {
                return "Password must include uppercase, lowercase, number and special character";
            }
        }
        return "";
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return "Confirm password is required";
        if (password !== confirmPassword) return "Passwords do not match";
        return "";
    };

    const validateName = (name) => {
        if (!name || name.trim() === "") return "Name is required";
        if (name.trim().length < 2) return "Name must be at least 2 characters";
        return "";
    };

    const validatePhone = (phone) => {
        if (!phone) return "Phone number is required";
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.toString())) return "Phone must be 10 digits";
        return "";
    };

    useEffect(() => {
        const newErrors = {};

        const emailErr = validateEmail(data.email);
        if (emailErr) newErrors.email = emailErr;

        const passwordErr = validatePassword(data.password, type === "Register");
        if (passwordErr) newErrors.password = passwordErr;

        if (type === "Register") {
            const nameErr = validateName(data.fullName);
            if (nameErr) newErrors.fullName = nameErr;

            const phoneErr = validatePhone(data.phone);
            if (phoneErr) newErrors.phone = phoneErr;

            const confirmPasswordErr = validateConfirmPassword(data.password, data.confirmPassword);
            if (confirmPasswordErr) newErrors.confirmPassword = confirmPasswordErr;
        }

        setErrors(newErrors);

        const isValid = Object.keys(newErrors).length === 0 && data.email && data.password && (type === "Login" || (data.fullName && data.phone && data.confirmPassword));
        setIsFormValid(isValid);
    }, [data, type]);

    const handleOnChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            onSubmit(e, data);
        }
    }

    return (
        <div className="row px-md-0 px-3 d-flex justify-content-center align-items-center h-100">
            <div className="col-md-5 col-lg-6 col-xl-5">
                <img src="/auth_bg.svg" className="img-fluid" alt="Sample image" />
            </div>
            <div className={`col-md-7 col-lg-6 ${type === "Register" ? "col-xl-6" : "col-xl-4"} offset-xl-1`}>
                <div className="mb-4">
                    <span className="fs-2 fw-bold text-success">{type.toUpperCase()}</span>
                    <h4> {type === "Login" ? "Welcome Back!" : "Create an Account"} </h4>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        {type === "Register" && (
                            <div className="form-floating col-md-6">
                                <input
                                    type="text"
                                    className={`form-control ${(data.fullName && errors.fullName) ? "is-invalid" : ""}`}
                                    id="floatingName"
                                    placeholder="Sample user"
                                    name="fullName"
                                    maxLength={26}
                                    value={data.fullName}
                                    onChange={handleOnChange}
                                />
                                <label htmlFor="floatingName">Name</label>
                                {data.fullName && errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
                            </div>
                        )}
                        {type === "Register" && (
                            <div className="form-floating col-md-6">
                                <input
                                    type="number"
                                    className={`form-control ${data.phone && errors.phone ? "is-invalid" : ""}`}
                                    id="floatingPhone"
                                    placeholder="+91 XXXXX XXXXX"
                                    name="phone"
                                    value={data.phone}
                                    onChange={handleOnChange}
                                />
                                <label htmlFor="floatingPhone">Phone</label>
                                {data.phone && errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                            </div>
                        )}
                        <div className={`form-floating ${type === "Register" ? "col-md-6" : 'col-12'}`}>
                            <input
                                type="email"
                                className={`form-control ${data.email && errors.email ? "is-invalid" : ""}`}
                                id="floatingEmail"
                                placeholder="name@example.com"
                                name="email"
                                value={data.email}
                                onChange={handleOnChange}
                            />
                            <label htmlFor="floatingEmail">Email Address</label>
                            {data.email && errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                        </div>
                        <div className={`${type === "Register" ? "col-md-6" : 'col-12'}`}>
                            <div className="d-flex align-items-center justify-content-end form-floating position-relative">
                                <input
                                    type={eye === true ? "text" : "password"}
                                    className={`form-control ${data.password && errors.password ? "is-invalid" : ""}`}
                                    id="floatingPassword"
                                    placeholder="Password"
                                    name="password"
                                    value={data.password}
                                    onChange={handleOnChange}
                                />
                                <label htmlFor="floatingPassword"> Password </label>
                                <div className="position-absolute px-2 m-1 bg-white text-secondary opacity-50" onClick={() => setEye(!eye)} style={{ cursor: "pointer" }}>
                                    {eye ? <RiEyeFill /> : <RiEyeCloseFill />}
                                </div>
                            </div>
                            {data.password && errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                        </div>

                        {type === "Register" && (
                            <div className="col-md-6">
                                <div className="d-flex align-items-center justify-content-end form-floating position-relative">
                                    <input
                                        type={eyeConfirm === true ? "text" : "password"}
                                        className={`form-control ${data.confirmPassword && errors.confirmPassword ? "is-invalid" : ""}`}
                                        id="floatingConfirmPassword"
                                        placeholder="Confirm Password"
                                        name="confirmPassword"
                                        value={data.confirmPassword}
                                        onChange={handleOnChange}
                                    />
                                    <label htmlFor="floatingConfirmPassword"> Confirm Password </label>
                                    <div className="position-absolute px-2 m-1 bg-white text-secondary opacity-50" onClick={() => setEyeConfirm(!eyeConfirm)} style={{ cursor: "pointer" }}>
                                        {eyeConfirm ? <RiEyeFill /> : <RiEyeCloseFill />}
                                    </div>
                                </div>
                                {data.confirmPassword && errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                            </div>
                        )}

                        {/* Address textarea removed from here */}

                        {type === "Register" && (
                            <div className="d-flex">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="checkChecked" defaultChecked />
                                    <label className="form-check-label fs-sm" htmlFor="checkChecked"> I agree with terms & Conditions </label>
                                </div>
                            </div>
                        )}
                        {type === "Login" && (
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="checkChecked" defaultChecked />
                                    <label className="form-check-label fs-sm" htmlFor="checkChecked"> Remember Me </label>
                                </div>
                                <Link to="/auth/forgot-password" size="sm" className="fs-sm">Forgot Password?</Link>
                            </div>
                        )}
                        <div>
                            <button type="submit" className="btn btn-success w-100 mb-3" disabled={!isFormValid}>
                                {type}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-3">
                    <p className="fs-sm text-center">
                        {type === "Login" ? "Don't have an account?" : "Already have an account?"}
                        <Link to={type === "Login" ? "/auth/register" : "/auth/login"} className="ms-1 text-success">
                            {type === "Login" ? "Register" : "Login"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Auth;