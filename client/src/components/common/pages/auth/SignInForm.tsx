"use client";
import { useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
import { toast } from "sonner";
import authApi from "@/lib/authApi";

// Define the schema for the login form
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the terms and privacy policy",
    }),
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const { setAuthToken, updateUser } = useUserStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      termsAccepted: true,
    },
  });

  const login = async (data: LoginFormData): Promise<boolean> => {
    try {
      const response = await authApi.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        setAuthToken(token);
        updateUser(userData);
        return true;
      } else {
        toast.error(
          "Login failed. Please check your credentials and try again."
        );
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
      return false;
    }
  };

  const onSubmit: (data: LoginFormData) => Promise<void> = async (data) => {
    setIsLoading(true);
    const success = await login(data);
    if (success) {
      toast.success("Logged in successfully!");
      router.push("/");
      setIsLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full px-4"
    >
      <Card className="w-full shadow-none border-0">
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-gray-500 font-normal">
                      I agree with the{" "}
                      <Link
                        href="/privacy"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/terms"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Terms of Use
                      </Link>
                    </FormLabel>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-lg transition-all duration-200"
                  disabled={isLoading || !form.watch("termsAccepted")}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" /> Signing in
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn /> Sign In
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center flex flex-col gap-5">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200"
            >
              Sign up
            </Link>
          </p>
          <CardDescription className="text-sm text-gray-600 text-center flex flex-col items-center space-y-4">
            <h3 className="font-semibold mb-2">About Our Website</h3>
            <p>
              Welcome to our platform, where you can explore a wide range of
              products, manage your cart, and track orders seamlessly. We aim to
              provide a user-friendly shopping experience with secure
              transactions and personalized features.
            </p>
            <h3 className="font-semibold mt-4 mb-2">Data Rules</h3>
            <p>
              Your privacy is our priority. We collect only necessary data
              (e.g., name, email) to process orders and enhance your experience.
              All data is encrypted and stored securely, and we never share it
              with third parties without consent. For details, see our{" "}
              <Link
                href="/privacy"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </CardDescription>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SignInForm;
