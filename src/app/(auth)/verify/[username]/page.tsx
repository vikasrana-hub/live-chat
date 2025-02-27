'use client'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { verifySchema } from '@/schemas/verifySchema'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'






function VerifyAccount() {
  const router = useRouter()
  const {username} = useParams()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },

  })
        

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {

    try {
    

      // Ensure username is not undefined
      if (!username) {
        toast({
          title: "Error",
          description: "Username is missing.",
          variant: "destructive"
        })
        return
      }
    
      await axios.post('/api/verify-code', {
        username,
        
        code: data.code
      })
      toast({
        title: "success",
        description: "verification successful"
      })
      router.push('/sign-in')
    } catch (error) {
    
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive"
      })

    }
  }
  return (<div className="flex items-center justify-center min-h-screen">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-center">VerifyAccount </h2>
      </div>

      <FormProvider{...form}>
      
      
        <form onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8">
          <FormField
            control={form.control}
            name="code"
            render={({ field}) => (
              <FormItem>
                <FormLabel>verify code</FormLabel>
                <FormControl>
                  <Input placeholder= "Enter Verification code"{...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full py-4 px-8 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300">
  Submit
</Button>

        </form>
      
        </FormProvider>


    </div>
  </div>
  )
}

export default VerifyAccount