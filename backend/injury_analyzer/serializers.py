from django.core.validators import MaxValueValidator, MinValueValidator
from rest_framework import serializers

from .constants import ONSET_TIMING_CHOICES, PAIN_LOCATIONS, PAIN_TYPES


class InjuryInputSerializer(serializers.Serializer):
    pain_location = serializers.CharField()
    pain_type = serializers.CharField()
    pain_scale = serializers.IntegerField(
        min_value=1,
        max_value=10,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
    )
    radiates = serializers.BooleanField()
    improved_after_warmup = serializers.BooleanField()
    sharp_during_lift = serializers.BooleanField()
    swelling = serializers.BooleanField()
    previous_injury = serializers.BooleanField()
    onset_timing = serializers.CharField()
    light_load_possible = serializers.BooleanField()

    def validate_pain_location(self, value):
        if value not in PAIN_LOCATIONS:
            raise serializers.ValidationError(
                f"Must be one of: {', '.join(PAIN_LOCATIONS)}"
            )
        return value

    def validate_pain_type(self, value):
        if value not in PAIN_TYPES:
            raise serializers.ValidationError(
                f"Must be one of: {', '.join(PAIN_TYPES)}"
            )
        return value

    def validate_onset_timing(self, value):
        if value not in ONSET_TIMING_CHOICES:
            raise serializers.ValidationError(
                f"Must be one of: {', '.join(ONSET_TIMING_CHOICES)}"
            )
        return value
