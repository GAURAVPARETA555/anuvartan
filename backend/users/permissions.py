from rest_framework.permissions import BasePermission
class IsPatient(BasePermission):
    def has_permission(self,request,view):
        return request.user.role=='PATIENT'
    
class IsNurse(BasePermission):
    def has_permission(self,request,view):
        return request.user.role=='NURSE'
    
class IsDoctor(BasePermission):
    def has_permission(self,request,view):
        return request.user.role=='DOCTOR'