from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView  # DRF API View
from rest_framework.response import Response  # DRF response object
from rest_framework import status  # DRF response status
# from rest_framework.authentication import SessionAuthentication
from django.shortcuts import render
import subprocess  # run code
from django.db import models  # throw `ObjectDoseNotExist` exception
from .models import Code
from .serializers import CodeListSerializer, CodeSerializer
# Create your views here.


# class CsrfExemptSessionAuthentication(SessionAuthentication):
#     """Remove CSRF
#     """

#     def enforce_csrf(self, request):
#         return


class APIRunCodeMixin(object):
    """Run code
    """

    def run_code(self, code):
        """Run code
        :param code: input code
        :type code: str
        :return: execute returlt
        :rtype: str
        """
        try:
            output = subprocess.check_output(['python', '-c', code],  # run code
                                             #  stderr=subprocess.STDOUT,  # re-dir error to subprocess
                                             universal_newlines=True,  # convert result to string
                                             timeout=30)  # set timeout
        except subprocess.CalledProcessError as err:
            output = err.output
        except subprocess.TimeoutExpired as err:
            output = '\n'.join(['Time out!', err.output])
        return output


class CodeViewSet(APIRunCodeMixin, ModelViewSet):
    """DRF view set for codes,
    Map request method on attribute

    :param APIRunCodeMixin: Run code
    :type APIRunCodeMixin: Mixin
    :param ModelViewSet: Relate view and models
    :type ModelViewSet: ViewSet
    """
    queryset = Code.objects.all()
    serializer_class = CodeSerializer

    def list_codes(self, request, *args, **kwargs):
        """List codes.
        Using list serializer

        """
        serializer = CodeListSerializer(self.get_queryset(), many=True)
        return Response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        # Threr is no `instance`, so `save` excute create
        serializer = self.serializer_class(data=request.data)
        return self.create_or_update(request, serializer)

    def update(self, request, *args, **kwargs):
        # Threr is `instance`, so `save` excute update
        instance = self.get_object()
        serializer = self.serializer_class(
            instance=instance, data=request.data)
        return self.create_or_update(request, serializer)

    def create_or_update(self, request, serializer):
        """Create/Update
        Difference is `instance`
        """
        if serializer.is_valid():
            code = serializer.validated_data.get('code')
            serializer.save()  # create/update instance
            if 'run' in request.query_params.keys():
                output = self.run_code(code)
                data = serializer.data
                data.update({'output': output})
                return Response(data=data, status=status.HTTP_201_CREATED)

            return Response(data=serializer.data,
                            status=status.HTTP_201_CREATED)

        return Response(data=serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)


class RunCodeAPIView(APIRunCodeMixin, APIView):
    """Run code api

    """

    def get(self, request, format=None):
        try:
            code = Code.objects.get(pk=request.query_params.get('id'))
        except models.ObjectDoesNotExist:
            return Response(data={'error': 'Object Not Found'},
                            status=status.HTTP_400_BAD_REQUEST)
        output = self.run_code(code.code)
        return Response(data={'output': output},
                        status=status.HTTP_200_OK)

    def post(self, request, format=None):
        output = self.run_code(request.data.get('code'))
        return Response(data={'output': output},
                        status=status.HTTP_200_OK)


def index(request):
    """ read templates """
    return render(request, 'index.html')
