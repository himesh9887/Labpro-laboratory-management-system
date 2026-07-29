/**
 * NumericInput – A clean numeric input that:
 * - Never shows "0" as a default value
 * - Never shows leading zeros (023 → 23)
 * - Stays empty when cleared
 * - Supports min / max / placeholder / className / step
 */
export default function NumericInput({
  value,
  onChange,
  placeholder = '',
  min = 0,
  max,
  step,
  className = 'field',
  disabled = false,
  id,
  name,
}) {
  const handleChange = (e) => {
    let raw = e.target.value;

    // Allow empty string
    if (raw === '' || raw === '-') {
      onChange('');
      return;
    }

    // Remove leading zeros (but keep "0." for decimals)
    if (raw.length > 1 && raw.startsWith('0') && !raw.startsWith('0.')) {
      raw = raw.replace(/^0+/, '');
      if (raw === '') raw = '';
    }

    onChange(raw);
  };

  const handleBlur = (e) => {
    const v = e.target.value.trim();
    if (v === '' || v === '-' || isNaN(Number(v))) {
      onChange('');
      return;
    }
    // Clamp to min/max on blur
    let num = Number(v);
    if (min !== undefined && num < Number(min)) num = Number(min);
    if (max !== undefined && num > Number(max)) num = Number(max);
    onChange(String(num));
  };

  return (
    <input
      id={id}
      name={name}
      type="number"
      inputMode="numeric"
      className={className}
      value={value === 0 ? '' : value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    />
  );
}
