import { string, z, array, number} from "zod"; 

const userRegisterSchemaProps = () =>{
    return {
        username: 
            string()
            .min(1, "Username is required")
            .min(3, "Username must contains at least 3 leters"),
        firstName: 
            string()
            .min(1, "First name is required")
            .min(3, "First name must contains at least 3 leters")
            .refine(str=> /^[A-Z]/.test(str[0]), "First name must start with Capital latter"),
        lastName: 
            string()
            .min(1, "Last name is required")
            .min(3, "First name must contains at least 3 leters")
            .refine(str=> /^[A-Z]/.test(str[0]), "First name must start with Capital latter"),
        avatar: z.any()
            .refine((file) => file?.size <= 300000, `Max image size is 3MB.`)
            .refine((file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."),
        email: string().email().optional(),
        // phone: string().transform(data => Number(data)),
        password: 
            string()
            .min(1, "Password is required")
            .min(4, "Username must contains at least 5 leters"),
        confirmPassword: string().min(1, "Password is required"),
        city: string().min(1, "City must be selected"),
        gender: string().min(1, "Gender must be selected")
    }
} 

export const clientRegisterSchema = z.object({
    ...userRegisterSchemaProps(),
    interests: array(string()).min(1, "Interests must be selected"),
}).refine(data => data.password === data.confirmPassword ,{
    //cheking on matching password
    message: "Password must match",
    path:["confirmPassword"]
})


export const houseworkerRegisterSchema = z.object({
    ...userRegisterSchemaProps(),
    age: string().min(1, "Age is required"),
    address: string().min(1).max(30),
    description: string().min(1),
    phoneNumber: string().min(9).max(14),
    professions: array(string()).min(1, "professions must be selected"),
    houseworkerProfessions: z.array(z.object({working_hour:z.string().min(1).max(3)}))
}).refine(data => data.password === data.confirmPassword ,{
    //cheking on matching password
    message: "Password must match",
    path:["confirmPassword"]
})
