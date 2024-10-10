import dbConnect from "@/lib/dbConnect";
import  {usernameValidation} from "@/schemas/signUpSchema";
import UserModel from "@/model/User";
import {z} from "zod";
import { NextRequest, NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: NextRequest) {
    await dbConnect();

    try {

        const { searchParams } = new URL(request.url);
        console.log(searchParams) 
        
        const queryParams = {
          username: searchParams.get('username'),
        };
    
        // validate with zod 
        const result = UsernameQuerySchema.safeParse(queryParams);
        
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return NextResponse.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters',
            },
            {
                status: 400
            })
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUser) {
            return NextResponse.json({
                success: false,
                message: 'Username already taken',
            },
            {
                status: 400
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Username is unique',
        }, {
            status: 200,
        });




        
    } catch (error) {
        console.error('Error checking username:', error);
        return NextResponse.json({
            success: false,
            message: 'Error checking username',
        },
    {
        status: 500
    })
        
    }

}
