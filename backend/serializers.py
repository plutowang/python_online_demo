from rest_framework import serializers
from .models import Code

# Create serializers for codes


class CodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code
        fields = '__all__'
        read_only_fields = ['created_time', 'changed_time']


class CodeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Code
        fields = ('id', 'name')
