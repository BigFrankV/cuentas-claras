from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError

# Formulario para crear nuevos usuarios desde el admin
class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Contraseña', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirmar contraseña', widget=forms.PasswordInput)

    class Meta:
        model = Usuario
        fields = ('username', 'email', 'first_name', 'last_name', 'rol', 'telefono', 'numero_residencia')

    def clean_password2(self):
        # Verificar que las contraseñas coincidan
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Las contraseñas no coinciden")
        return password2

    def save(self, commit=True):
        # Guardar la contraseña en formato hash
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

# Formulario para actualizar usuarios
class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(
        label="Contraseña",
        help_text=(
            "Las contraseñas no se almacenan en texto plano, por lo que no hay "
            "forma de ver la contraseña de este usuario, pero puede cambiarla "
            "usando <a href=\"../password/\">este formulario</a>."
        ),
    )

    class Meta:
        model = Usuario
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'rol', 
                 'telefono', 'numero_residencia', 'is_active', 'is_staff', 'is_superuser')

# Configuración del panel de administración para el modelo Usuario
class UsuarioAdmin(UserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    
    # Campos que se muestran en la lista de usuarios
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'numero_residencia', 'is_staff')
    list_filter = ('rol', 'is_staff', 'is_superuser', 'is_active')
    
    # Campos para la búsqueda
    search_fields = ('username', 'email', 'first_name', 'last_name', 'numero_residencia')
    
    # Ordenar por nombre de usuario
    ordering = ('username',)
    
    # Configuración de los campos en el formulario de edición
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'email')}),
        ('Información de residencia', {'fields': ('rol', 'telefono', 'numero_residencia')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Configuración de los campos en el formulario de creación
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'first_name', 'last_name', 'rol', 'telefono', 'numero_residencia', 'password1', 'password2'),
        }),
    )

# Registrar el modelo Usuario con la configuración personalizada
admin.site.register(Usuario, UsuarioAdmin)
