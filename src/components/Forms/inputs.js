import React from 'react';

function FormInputs({ inputs }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '5px' }}>
            {inputs.map((input, index) => {
                const {
                    placeholder = "",
                    value = "",
                    type = "text",
                    width = "300px",
                    style = "width:300px;height:100px",
                    mandatory = false,
                    bold = false,
                    name,
                    description,
                    id = name,
                    options
                } = input;

                let formattedDescription = bold ? <b>{description}</b> : description;

                if (type === "text") {
                    return (
                        <div key={index} style={{ marginRight: '10px', marginBottom: '5px' }} id={`${id}_input_div`}>
                            <div style={{ marginBottom: '5px' }}>
                                {formattedDescription}
                                {mandatory && <span className="star" id="i4" aria-label="Required question">*</span>}
                            </div>
                            <input 
                                className="form-input"
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                value={value}
                                style={{ width, height: '30px' }}
                                required={mandatory}
                            />
                        </div>
                    );
                }

                if (type === "radio") {
                    return (
                        <div key={index} style={{ marginRight: '10px', marginBottom: '5px' }} id={`${id}_input_div`}>
                            <div style={{ marginBottom: '5px' }}>
                                {formattedDescription}
                                {mandatory && <span className="star" id="i4" aria-label="Required question">*</span>}
                            </div>
                            {options.map((option, optionIndex) => (
                                <label key={optionIndex} className={value === option ? "button button--primary" : "button button--secondary"} style={{ marginRight: '5px', marginBottom: '5px' }}>
                                    <input
                                        type="radio"
                                        name={name}
                                        value={option}
                                        style={{ display: 'none' }}
                                        required={mandatory}
                                        checked={value === option}
                                    />
                                    {option}
                                </label>
                            ))}
                            {value ? <input type="hidden" name={name} value={value} /> : <input type="radio" name={name} value="default" style={{ display: 'none' }} defaultChecked />}
                        </div>
                    );
                }

				if (type === "textarea") {
					const parsedStyle = {};
					const styleParts = style.split(';').filter(part => part.trim() !== '');
					styleParts.forEach(part => {
						const [key, value] = part.split(':');
						parsedStyle[key.trim()] = value.trim();
					});

					return (
						<div key={index} style={{ marginRight: '10px' }} id={`${id}_input_div`}>
							<label>
								<div style={{ marginBottom: '5px' }}>{formattedDescription}</div>
								<textarea
									className="form-input"
									name={name}
									style={parsedStyle}
									placeholder={placeholder}
									defaultValue={value} // Use defaultValue here
								></textarea>
							</label>
						</div>
					);
}


                return null; // Return null for unknown types
            })}
        </div>
    );
}

export default FormInputs;
