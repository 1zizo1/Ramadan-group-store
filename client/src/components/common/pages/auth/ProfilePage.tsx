/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, LogOut, User as  ShieldCheck, MapPin,
Camera, Plus, Trash2, Pencil  
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";

import authApi from "@/lib/authApi";
import { useUserStore } from "@/lib/store";

const ProfilePage = () => {
  const { authUser, updateUser, logoutUser, isAuthenticated } = useUserStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Form States
  const [name, setName] = useState(authUser?.name || "");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const initials = authUser?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  // --- HANDLERS ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await authApi.put(`/users/${authUser?._id}`, { name });
      updateUser(data);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setIsLoading(true);
      try {
        const { data } = await authApi.put(`/users/${authUser?._id}`, { avatar: reader.result });
        updateUser(data);
        toast.success("Avatar updated");
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setIsLoading(false);
      }
    };
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwords do not match");

    setIsLoading(true);
    try {
      await authApi.put(`/users/${authUser?._id}`, { password: passwords.new });
      toast.success("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addressData = {
      street: formData.get("street"),
      city: formData.get("city"),
      country: formData.get("country"),
      postalCode: formData.get("postalCode"),
      isDefault: formData.get("isDefault") === "on",
    };

    setIsLoading(true);
    try {
      let response;
      if (editingAddress) {
        response = await authApi.put(`/users/${authUser?._id}/addresses/${editingAddress._id}`, addressData);
      } else {
        response = await authApi.post(`/users/${authUser?._id}/addresses`, addressData);
      }

      // Update local store with new address array from backend
      if (authUser) {
        updateUser({ ...authUser, addresses: response.data.addresses });
      }

      toast.success(editingAddress ? "Address updated" : "Address added");
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      const { data } = await authApi.delete(`/users/${authUser?._id}/addresses/${addressId}`);
      if (authUser) updateUser({ ...authUser, addresses: data.addresses });
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-700 w-full" />

      <div className="container max-w-5xl mx-auto -mt-24 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: User Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block group">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg mx-auto">
                    <AvatarImage src={authUser?.avatar} />
                    <AvatarFallback className="text-3xl bg-indigo-100 text-indigo-700">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-slate-50 border transition-transform hover:scale-110"
                  >
                    <Camera className="h-4 w-4 text-slate-600" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">{authUser?.name}</h2>
                <p className="text-slate-500 text-sm mb-4">{authUser?.email}</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    <ShieldCheck className="w-3 h-3 mr-1" /> {authUser?.role}
                  </Badge>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="p-0">
                <Button
                  variant="ghost"
                  onClick={logoutUser}
                  className="w-full py-6 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-t-none"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* RIGHT COLUMN: Interactive Tabs */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="bg-white p-1 border shadow-sm mb-6 w-full flex justify-start sm:w-auto h-auto overflow-x-auto">
                <TabsTrigger value="general" className="px-6 py-2.5">General</TabsTrigger>
                <TabsTrigger value="addresses" className="px-6 py-2.5">Addresses</TabsTrigger>
                <TabsTrigger value="security" className="px-6 py-2.5">Security</TabsTrigger>
                <TabsTrigger value="orders" className="px-6 py-2.5" onClick={() => router.push('/orders')}>Orders</TabsTrigger>
              </TabsList>

              {/* GENERAL TAB */}
              <TabsContent value="general">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your basic account details.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="grid gap-2 opacity-60">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={authUser?.email} disabled />
                        <p className="text-[10px] text-slate-500">Email cannot be changed.</p>
                      </div>
                      <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ADDRESSES TAB */}
              <TabsContent value="addresses" className="space-y-6 outline-none">
                <Card className="border-none shadow-md">
                  <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Shipping Addresses</h3>
                      <p className="text-sm text-slate-500">Manage your delivery locations for faster checkout.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add New Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {/* Empty State Logic */}
                    {(!authUser?.addresses || authUser.addresses.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <MapPin className="h-10 w-10 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-900">No addresses saved</h4>
                        <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">
                          Add a shipping address to make your next purchase seamless.
                        </p>
                        <Button variant="outline" onClick={() => setIsAddressModalOpen(true)}>
                          Create your first address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {authUser.addresses.map((addr) => (
                          <Card
                            key={addr._id}
                            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md ${addr.isDefault
                              ? 'border-indigo-500 ring-1 ring-indigo-500/10 bg-indigo-50/10'
                              : 'hover:border-slate-300'
                              }`}
                          >
                            <CardContent className="pt-6">
                              {/* Status Header */}
                              <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${addr.isDefault ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                  <MapPin className="w-5 h-5" />
                                </div>
                                {addr.isDefault && (
                                  <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[10px] uppercase tracking-wider font-bold">
                                    Default
                                  </Badge>
                                )}
                              </div>

                              {/* Address Details */}
                              <div className="space-y-1">
                                <p className="font-bold text-slate-900 text-lg leading-tight">{addr.street}</p>
                                <p className="text-slate-600 text-sm">{addr.city}, {addr.postalCode}</p>
                                <p className="text-slate-500 text-sm font-medium">{addr.country}</p>
                              </div>

                              {/* Action Footer */}
                              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 px-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-1"
                                  onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors flex-1"
                                  onClick={() => deleteAddress(addr._id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                </Button>
                              </div>
                            </CardContent>

                            {/* Subtle background decoration for the default card */}
                            {addr.isDefault && (
                              <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-600 rotate-12 pointer-events-none">
                                <MapPin className="w-24 h-24" />
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}

                  </CardContent>

                </Card>
              </TabsContent>
              {/* SECURITY TAB */}
              <TabsContent value="security">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="new-pass">New Password</Label>
                        <Input type="password" id="new-pass" value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-pass">Confirm New Password</Label>
                        <Input type="password" id="confirm-pass" value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                      </div>
                      <Button type="submit" disabled={isLoading} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ADDRESS DIALOG */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddressAction}>
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>Fill in the shipping details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" name="street" defaultValue={editingAddress?.street} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={editingAddress?.city} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" defaultValue={editingAddress?.postalCode} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={editingAddress?.country} required />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="isDefault" name="isDefault" defaultChecked={editingAddress?.isDefault} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAddress ? "Update Address" : "Add Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;