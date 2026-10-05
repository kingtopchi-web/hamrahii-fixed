
// import React, { useEffect, useState } from 'react';
// import { Eye, EyeOff, Mail, Lock, Smartphone, User, Calendar, Camera } from 'lucide-react'
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { setUserDetails } from '../../store/userReducer';
// import Axios from '../../services/axios';
// import { api } from '../../services/endpoints';
// import { toast } from 'react-toastify';

// const GoogleLogin = () => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [profilePhotos, setProfilePhotos] = useState([
//         { url: 'https://res.cloudinary.com/hamrahi/image/upload/v1/default-avatar.png', isDefault: true }
//     ]);

//     const [newUser, setNewUser] = useState({})
//     const [isRegistered, setIsRegistered] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const user = useSelector(state => state.user)

//     const dispatch = useDispatch()
//     const location = useLocation()
//     const navigate = useNavigate()

//     useEffect(() => {
//         console.log(location?.state?.user, "  this is data of location")
//         setNewUser(location?.state?.user)
//         setFormData((prev) => ({ ...prev, firstName: location?.state?.user?.firstName, email: location?.state?.user?.email }))
//     }, [location])

//     const [formData, setFormData] = useState({
//         firstName: "",
//         lastName: '',
//         email: "",
//         phone: '',
//         password: '',
//         dateOfBirth: '',
//         gender: ''
//     });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         try {
//             const userData = {
//                 ...formData,
//                 profilePhotos
//             };
//             console.log('Form submitted:', userData);

//             if (!user.email) {
//                 const res = await Axios.post(api.user.googleRegistration, userData)
//                 console.log(res, " this is response of google registration")

//                 if (res.data.success) {
//                     dispatch(setUserDetails(res?.data?.data))
//                     toast.success(res?.data?.message || "User registered successfully")
//                     setIsRegistered(true); // Set registered flag
//                 }
//             }
//         } catch (error) {
//             toast.error(error?.response?.data?.message)
//             console.log(error, ' this is error ')
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSign = async (e) => {
//         setIsLoading(true);
//         try {
//             if (user.email) {
//                 const response = await Axios.post(api.user.googleSignIn, { 
//                     email: user.email, 
//                     password: formData.password 
//                 })
//                 console.log(response, "this is response of google signin")
//                 if (response?.data?.success) {
//                     dispatch(setUserDetails(response?.data?.user))
//                     toast.success(response?.data?.message || "User logged in successfully")
//                     navigate("/")
//                 }
//             }
//         } catch (error) {
//             toast.error(error?.response?.data?.message)
//             console.log(error, ' this is error ')
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handlePhotoUpload = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 const newPhoto = {
//                     url: reader.result,
//                     isDefault: false
//                 };
//                 setProfilePhotos([newPhoto]);
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const removePhoto = (index) => {
//         if (!profilePhotos[index]?.isDefault) {
//             const newPhotos = [...profilePhotos];
//             newPhotos.splice(index, 1);
//             if (newPhotos?.length === 0) {
//                 newPhotos.push({
//                     url: 'https://res.cloudinary.com/hamrahi/image/upload/v1/default-avatar.png',
//                     isDefault: true
//                 });
//             }
//             setProfilePhotos(newPhotos);
//         }
//     };

//     useEffect(() => {
//         if (user?.email) {
//             navigate("/")
//         }
//     }, [])

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
//             <div className="w-full max-w-3xl bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-2xl overflow-hidden border border-emerald-100/50">
//                 <div className="p-8 md:p-10">
//                     {/* Header */}
//                     <div className="text-center mb-10">
//                         <div className="relative w-32 h-32 mx-auto mb-6">
//                             <div className="w-full h-full rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg">
//                                 <img
//                                     src={newUser[0]?.url}
//                                     alt="Profile"
//                                     className="w-full h-full object-cover"
//                                 />
//                             </div>
//                             <label className="absolute bottom-2 right-2 bg-emerald-500 text-white p-3 rounded-full cursor-pointer hover:bg-emerald-600 transition-all duration-300 transform hover:scale-110 shadow-lg">
//                                 <Camera size={20} />
//                                 <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handlePhotoUpload}
//                                     className="hidden"
//                                 />
//                             </label>
//                         </div>
//                         <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
//                             {isRegistered ? "Account Created!" : "Complete Your Profile"}
//                         </h1>
//                         <p className="text-gray-600 mt-3">
//                             {isRegistered ? "You can now sign in to your account" : "Fill in your details to create your account"}
//                         </p>
//                     </div>

//                     {/* Form */}
//                     <form onSubmit={handleSubmit} className="space-y-7">
//                         {/* First Name & Last Name */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="group">
//                                 <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
//                                     <User className="w-5 h-5 mr-2" />
//                                     First Name *
//                                 </label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         name="firstName"
//                                         value={formData.firstName}
//                                         required
//                                         minLength={2}
//                                         maxLength={50}
//                                         className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
//                                         placeholder="Enter your first name"
//                                         disabled={isRegistered || isLoading}
//                                     />
//                                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
//                                         {formData.firstName?.length >= 2 && (
//                                             <span className="text-xs font-medium">✓</span>
//                                         )}
//                                     </div>
//                                 </div>
//                                 <div className="flex justify-between mt-2">
//                                     <span className={`text-xs ${formData.firstName?.length < 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
//                                         Min 2 characters
//                                     </span>
//                                     <span className="text-xs text-gray-400">
//                                         {formData.firstName?.length}/50
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="group">
//                                 <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
//                                     <User className="w-5 h-5 mr-2" />
//                                     Last Name
//                                 </label>
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         name="lastName"
//                                         value={formData.lastName}
//                                         onChange={handleChange}
//                                         className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
//                                         placeholder="Enter your last name"
//                                         disabled={isRegistered || isLoading}
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Email */}
//                         <div className="group">
//                             <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
//                                 <Mail className="w-5 h-5 mr-2" />
//                                 Email Address *
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
//                                     placeholder="your.email@example.com"
//                                     disabled={isRegistered || isLoading}
//                                 />
//                                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
//                                     {formData?.email?.includes('@') && (
//                                         <span className="text-xs font-medium">✓</span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Phone */}
//                         <div className="group">
//                             <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
//                                 <Smartphone className="w-5 h-5 mr-2" />
//                                 Phone Number *
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="tel"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
//                                     placeholder="+1 (234) 567-8900"
//                                     disabled={isRegistered || isLoading}
//                                 />
//                                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
//                                     {formData?.phone?.length >= 10 && (
//                                         <span className="text-xs font-medium">✓</span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Password */}
//                         <div className="group">
//                             <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
//                                 <Lock className="w-5 h-5 mr-2" />
//                                 Password *
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                     minLength={8}
//                                     className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200 pr-12"
//                                     placeholder="••••••••"
//                                     disabled={isRegistered || isLoading}
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors"
//                                     disabled={isRegistered || isLoading}
//                                 >
//                                     {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                                 </button>
//                             </div>
//                             <div className="flex justify-between mt-2">
//                                 <span className={`text-xs ${formData.password.length > 0 && formData.password.length < 8 ? 'text-amber-500' : 'text-emerald-500'}`}>
//                                     Min 8 characters
//                                 </span>
//                                 <span className="text-xs text-gray-400">
//                                     {formData.password?.length}/∞
//                                 </span>
//                             </div>
//                         </div>

//                         {/* Date of Birth */}
//                         <div className="group">
//                             <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
//                                 <Calendar className="w-5 h-5 mr-2" />
//                                 Date of Birth *
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="date"
//                                     name="dateOfBirth"
//                                     value={formData.dateOfBirth}
//                                     onChange={handleChange}
//                                     required
//                                     className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200 appearance-none"
//                                     disabled={isRegistered || isLoading}
//                                 />
//                                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
//                                     {formData.dateOfBirth && (
//                                         <span className="text-xs font-medium">✓</span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Gender */}
//                         <div className="group">
//                             <label className="block text-sm font-semibold text-emerald-700 mb-3">
//                                 Gender
//                             </label>
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                                 {['male', 'female', 'other', 'prefer-not-to-say'].map((option) => (
//                                     <button
//                                         key={option}
//                                         type="button"
//                                         onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
//                                         className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${formData.gender === option
//                                             ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg'
//                                             : 'bg-white/70 border-emerald-100 text-gray-700 hover:border-emerald-300 hover:shadow-md'
//                                             } ${(isRegistered || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                         disabled={isRegistered || isLoading}
//                                     >
//                                         {option.split('-').map(word =>
//                                             word.charAt(0).toUpperCase() + word.slice(1)
//                                         ).join(' ')}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Create Account Button - Only show if not registered */}
//                         {!isRegistered && (
//                             <div className="pt-8">
//                                 <button
//                                     type="submit"
//                                     disabled={!formData.firstName || !formData.phone || !formData.password || !formData.dateOfBirth || isLoading}
//                                     className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center"
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Creating Account...
//                                         </>
//                                     ) : (
//                                         'Create Account'
//                                     )}
//                                 </button>
//                             </div>
//                         )}

//                         {/* Sign In Button - Show only if registered */}
//                         {isRegistered && (
//                             <div className="pt-8">
//                                 <button
//                                     type="button"
//                                     onClick={handleSign}
//                                     disabled={isLoading}
//                                     className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center"
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Signing In...
//                                         </>
//                                     ) : (
//                                         'Sign In'
//                                     )}
//                                 </button>
//                             </div>
//                         )}

//                         {/* Footer */}
//                         <div className="text-center pt-6 border-t border-emerald-100">
//                             <p className="text-sm text-gray-600">
//                                 By creating an account, you agree to our{' '}
//                                 <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium">Terms</a> and{' '}
//                                 <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium">Privacy Policy</a>
//                             </p>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default GoogleLogin;

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Smartphone, User, Calendar, Camera } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserDetails } from '../../store/userReducer';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { toast } from 'react-toastify';
import { clearUserSessionDrafts } from '../../utils/sessionCleaner';

const GoogleLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [profilePhotos, setProfilePhotos] = useState([
        { url: 'https://res.cloudinary.com/hamrahi/image/upload/v1/default-avatar.png', isDefault: true }
    ]);

    const [newUser, setNewUser] = useState({})
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector(state => state.user)

    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        console.log(location?.state?.user, "  this is data of location")
        const googleUser = location?.state?.user;
        setNewUser(googleUser);
        
        if (googleUser?.firstName) {
            // Split the first name into words
            const nameParts = googleUser.firstName.trim().split(/\s+/);
            
            if (nameParts.length > 1) {
                // Last word becomes last name
                const lastName = nameParts.pop();
                // Remaining words become first name
                const firstName = nameParts.join(' ');
                
                setFormData(prev => ({ 
                    ...prev, 
                    firstName: firstName,
                    lastName: lastName,
                    email: googleUser?.email 
                }));
            } else {
                // Only one word, keep as first name
                setFormData(prev => ({ 
                    ...prev, 
                    firstName: googleUser.firstName,
                    email: googleUser?.email 
                }));
            }
        } else {
            setFormData(prev => ({ 
                ...prev, 
                email: googleUser?.email 
            }));
        }
    }, [location])

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: '',
        email: "",
        phone: '',
        password: '',
        dateOfBirth: '',
        gender: ''
    });

    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        const nameParts = value.trim().split(/\s+/);
        
        if (nameParts.length > 1) {
            // Last word becomes last name
            const lastName = nameParts.pop();
            const firstName = nameParts.join(' ');
            
            setFormData(prev => ({
                ...prev,
                firstName: firstName,
                lastName: lastName
            }));
        } else {
            // Only one word, clear last name
            setFormData(prev => ({
                ...prev,
                firstName: value,
                lastName: ''
            }));
        }
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            lastName: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userData = {
                ...formData,
                profilePhotos
            };
            console.log('Form submitted:', userData);

            if (!user.email) {
                const res = await Axios.post(api.user.googleRegistration, userData)
                console.log(res, " this is response of google registration")

                if (res.data.success) {
                    clearUserSessionDrafts();
                    dispatch(setUserDetails(res?.data?.data))
                    toast.success(res?.data?.message || "User registered successfully")
                    setIsRegistered(true);
                }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error, ' this is error ')
        } finally {
            setIsLoading(false);
        }
    };

    const handleSign = async (e) => {
        setIsLoading(true);
        try {
            if (user.email) {
                const response = await Axios.post(api.user.googleSignIn, { 
                    email: user.email, 
                    password: formData.password 
                })
                console.log(response, "this is response of google signin")
                if (response?.data?.success) {
                    clearUserSessionDrafts();
                    dispatch(setUserDetails(response?.data?.user))
                    toast.success(response?.data?.message || "User logged in successfully")
                    navigate("/")
                }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error, ' this is error ')
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Skip firstName and lastName as they have special handlers
        if (name !== 'firstName' && name !== 'lastName') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhoto = {
                    url: reader.result,
                    isDefault: false
                };
                setProfilePhotos([newPhoto]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (index) => {
        if (!profilePhotos[index]?.isDefault) {
            const newPhotos = [...profilePhotos];
            newPhotos.splice(index, 1);
            if (newPhotos?.length === 0) {
                newPhotos.push({
                    url: 'https://res.cloudinary.com/hamrahi/image/upload/v1/default-avatar.png',
                    isDefault: true
                });
            }
            setProfilePhotos(newPhotos);
        }
    };

    useEffect(() => {
        if (user?.email) {
            navigate("/")
        }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl shadow-2xl overflow-hidden border border-emerald-100/50">
                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg">
                                <img
                                    src={newUser[0]?.url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label className="absolute bottom-2 right-2 bg-emerald-500 text-white p-3 rounded-full cursor-pointer hover:bg-emerald-600 transition-all duration-300 transform hover:scale-110 shadow-lg">
                                <Camera size={20} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {isRegistered ? "Account Created!" : "Complete Your Profile"}
                        </h1>
                        <p className="text-gray-600 mt-3">
                            {isRegistered ? "You can now sign in to your account" : "Fill in your details to create your account"}
                        </p>
                        {!isRegistered && (
                            <p className="text-sm text-emerald-600 mt-2">
                                💡 Tip: Type full name in first name field - last word will automatically go to last name
                            </p>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleFirstNameChange}
                                        required
                                        minLength={2}
                                        maxLength={50}
                                        className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
                                        placeholder="Enter your full name (e.g., John Doe)"
                                        disabled={isRegistered || isLoading}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
                                        {formData.firstName?.length >= 2 && (
                                            <span className="text-xs font-medium">✓</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className={`text-xs ${formData.firstName?.length < 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        Min 2 characters
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formData.firstName?.length}/50
                                    </span>
                                </div>
                                {formData.lastName && (
                                    <p className="text-xs text-emerald-600 mt-1">
                                        ✓ Last name detected: <span className="font-medium">{formData.lastName}</span>
                                    </p>
                                )}
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Last Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleLastNameChange}
                                        className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
                                        placeholder="Auto-filled or enter manually"
                                        disabled={isRegistered || isLoading}
                                    />
                                    {formData.lastName && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
                                            <span className="text-xs font-medium">✓</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                        Auto-extracted from full name
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formData.lastName?.length}/50
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                Email Address *
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
                                    placeholder="your.email@example.com"
                                    disabled={isRegistered || isLoading}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
                                    {formData?.email?.includes('@') && (
                                        <span className="text-xs font-medium">✓</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
                                <Smartphone className="w-5 h-5 mr-2" />
                                Phone Number *
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200"
                                    placeholder="+91 9876543210"
                                    disabled={isRegistered || isLoading}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
                                    {formData?.phone?.length >= 10 && (
                                        <span className="text-xs font-medium">✓</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
                                <Lock className="w-5 h-5 mr-2" />
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200 pr-12"
                                    placeholder="••••••••"
                                    disabled={isRegistered || isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700 transition-colors"
                                    disabled={isRegistered || isLoading}
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className={`text-xs ${formData.password.length > 0 && formData.password.length < 8 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    Min 8 characters
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formData.password?.length}/∞
                                </span>
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Date of Birth *
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-white/70 rounded-xl border-2 border-emerald-100 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 placeholder-gray-400 group-hover:border-emerald-200 appearance-none"
                                    disabled={isRegistered || isLoading}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400">
                                    {formData.dateOfBirth && (
                                        <span className="text-xs font-medium">✓</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-emerald-700 mb-3">
                                Gender
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['male', 'female', 'other', 'prefer-not-to-say'].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
                                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${formData.gender === option
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg'
                                            : 'bg-white/70 border-emerald-100 text-gray-700 hover:border-emerald-300 hover:shadow-md'
                                            } ${(isRegistered || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isRegistered || isLoading}
                                    >
                                        {option.split('-').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Create Account Button - Only show if not registered */}
                        {!isRegistered && (
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={!formData.firstName || !formData.phone || !formData.password || !formData.dateOfBirth || isLoading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Sign In Button - Show only if registered */}
                        {isRegistered && (
                            <div className="pt-8">
                                <button
                                    type="button"
                                    onClick={handleSign}
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center pt-6 border-t border-emerald-100">
                            <p className="text-sm text-gray-600">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium">Terms</a> and{' '}
                                <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium">Privacy Policy</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GoogleLogin;