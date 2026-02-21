from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .scoring import compute_all
from .serializers import InjuryInputSerializer


@api_view(["POST"])
def analyze(request):
    serializer = InjuryInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    result = compute_all(serializer.validated_data)
    return Response(result, status=status.HTTP_200_OK)
