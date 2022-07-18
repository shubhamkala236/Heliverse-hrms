const { EmployeeRepository } = require("../database");
const { FormateData,GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword,SendEmail } = require("../utils");
const { APIError } = require('../utils/app-errors');
const {sendMail} = require('../utils/sendEmail');
const cloudinary = require('../utils/cloudinary');



// All Business logic will be here

class EmployeeService{

    constructor(){
        this.repository = new EmployeeRepository();
    }
    
    // ---------------------REGISTER/CREATE EMPLOYEEE------------------------
    async CreateEmployee(employeeInputs){

        const { name, email, dateOfBirth, phoneNumber,current_address, perma_address, adhaarNumber, panNumber,bankAccountNumber,ifsc,passBookNumber,role,designation,password,id,file  } = employeeInputs; //path
        // cloudinary upload
        const uploaded = await cloudinary.uploader.upload(file.tempFilePath);
        
        const url = uploaded.url;

        // create salt
        let salt = await GenerateSalt();
        
        let userPassword = await GeneratePassword(password, salt);
        
        try{
            const employeeResult = await this.repository.CreateEmployee({ name, email, dateOfBirth, phoneNumber,current_address, perma_address, adhaarNumber, panNumber,bankAccountNumber,ifsc,passBookNumber,role,designation,password: userPassword,id,salt,imageUrl:url}); 
            return FormateData(employeeResult);
        }catch(err){
            console.log(err);
            throw new APIError('Data Not found')
        }
    }

    //Admin Update User/id:
    async UpdateUserDetail(Id,userData){
        
        try {
            const existingUser = await this.repository.FindAndUpdate(Id,userData);
            if(existingUser)
            {
                return FormateData(existingUser);
            }

    
            return FormateData(null);

        } catch (err) {
            console.log(err);
            throw new APIError('Data Not found', err)
        }

       
    }

    //Admin Delete User/id:
    async DeleteEmployee(Id){
        
        try {
            const existingUser = await this.repository.Delete(Id);
            const res = "user Deleted Successfully"
            if(existingUser)
            {
                return FormateData(res);
            }

    
            return FormateData(null);

        } catch (err) {
            console.log(err);
            throw new APIError('Data Not found', err)
        }

       
    }

    
    //Employee login
    async LoginIn(userInputs){

        const { email, password } = userInputs;
        
        try {
            
            const existingUser = await this.repository.FindEmployee({ email});

            if(existingUser){
            
                const validPassword = await ValidatePassword(password, existingUser.password, existingUser.salt);
                
                if(validPassword){
                    const token = await GenerateSignature({ email: existingUser.email, _id: existingUser._id});
                    return FormateData({id: existingUser._id, token });
                } 
            }
    
            return FormateData(null);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }

       
    }
    
    
    async GetAllEmployees(){
        try{
            const employee = await this.repository.Employees();
            
            return FormateData({
                employee,
            })
            
        }catch(err){
            throw new APIError('Data Not found')
        }
    }
    
    async GetEmployeeById(employeeId){
        try {
            const employee = await this.repository.FindById(employeeId);
            return FormateData(employee)
        } catch (err) {
            throw new APIError('Data Not found')
        }
    }

    //user signup
    async UserSignUp(userInputs){
        
        const { email, password, details, role } = userInputs;
        
        try{
            // create salt
            let salt = await GenerateSalt();
            
            let userPassword = await GeneratePassword(password, salt);
            
            const existingUser = await this.repository.CreateUser({ email, password: userPassword, details,role, salt});
            
            const token = await GenerateSignature({ email: email, _id: existingUser._id});
            


            return FormateData({id: existingUser._id, token });

        }catch(err){
            throw new APIError('Data Not found', err)
        }

    }

    //user login
    async SignIn(userInputs){

        const { email, password } = userInputs;
        
        try {
            
            const existingUser = await this.repository.FindUser({ email});

            if(existingUser){
            
                const validPassword = await ValidatePassword(password, existingUser.password, existingUser.salt);
                
                if(validPassword){
                    const token = await GenerateSignature({ email: existingUser.email, _id: existingUser._id});
                    return FormateData({id: existingUser._id, token });
                } 
            }
    
            return FormateData(null);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }

       
    }

    //create dummy employee
    async CreateDummyEmployee(employeeInputs){
        // const {email} = employeeInputs; 
        try{
            const employeeResult = await this.repository.CreateDumEmployee(employeeInputs)
            //send mail after storing in dummydB
            if(employeeResult){
                const email= employeeResult.email;
                const id= employeeResult._id;
               await sendMail(email,id)
            }

            return FormateData(employeeResult);
        }catch(err){
            console.log(err);
            throw new APIError('Data Not found')
        }
    }


    
}

module.exports = EmployeeService;
